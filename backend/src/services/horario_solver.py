#!/usr/bin/env python3
"""
Solver de horarios escolares usando Google OR-Tools CP-SAT.
Lee JSON desde stdin, escribe JSON en stdout.

Entrada esperada:
  {
    "bloques_tiempo":     [{ "id", "dia", "hora" }],
    "aulas":              [{ "id", "nombre", "tipo" }],
    "grupos":             [{ "id", "nombre" }],
    "profesores":         [{ "id", "nombre" }],
    "clases_por_asignar": [{ "id", "materia", "profesor_id", "grupo_id", "tipo_aula" }]
  }

Salida:
  { "status": "FEASIBLE"|"INFEASIBLE", "horario": [...] }
"""

import json
import sys

try:
    from ortools.sat.python import cp_model
except ImportError:
    print(json.dumps({
        "status": "ERROR",
        "message": "ortools no instalado. Ejecuta: pip install ortools",
        "horario": []
    }), flush=True)
    sys.exit(1)


def resolver(data):
    bloques    = data["bloques_tiempo"]
    aulas      = data["aulas"]
    clases     = data["clases_por_asignar"]
    profesores = data["profesores"]
    grupos     = data["grupos"]

    n_c = len(clases)
    n_b = len(bloques)
    n_a = len(aulas)

    if n_c == 0 or n_b == 0 or n_a == 0:
        return {"status": "INFEASIBLE", "horario": [],
                "message": "Datos insuficientes: se necesitan clases, bloques y aulas."}

    model = cp_model.CpModel()

    # Variable booleana: clase ci se dicta en bloque bi usando aula ai
    x = {}
    for ci in range(n_c):
        for bi in range(n_b):
            for ai in range(n_a):
                x[ci, bi, ai] = model.NewBoolVar(f"x_{ci}_{bi}_{ai}")

    # ── Restriccion 1: cada clase se asigna EXACTAMENTE a 1 bloque + 1 aula ──
    for ci in range(n_c):
        model.AddExactlyOne(
            x[ci, bi, ai] for bi in range(n_b) for ai in range(n_a)
        )

    # ── Restriccion 2: tipo de aula debe coincidir ────────────────────────────
    for ci, c in enumerate(clases):
        for ai, a in enumerate(aulas):
            if a["tipo"] != c["tipo_aula"]:
                for bi in range(n_b):
                    model.Add(x[ci, bi, ai] == 0)

    # ── Restriccion 3: un profesor no puede estar en 2 clases al mismo tiempo ─
    prof_clases = {}
    for ci, c in enumerate(clases):
        prof_clases.setdefault(c["profesor_id"], []).append(ci)

    for _pid, cis in prof_clases.items():
        if len(cis) > 1:
            for bi in range(n_b):
                model.AddAtMostOne(
                    x[ci, bi, ai] for ci in cis for ai in range(n_a)
                )

    # ── Restriccion 4: un grupo no puede tener 2 clases al mismo tiempo ───────
    grupo_clases = {}
    for ci, c in enumerate(clases):
        grupo_clases.setdefault(c["grupo_id"], []).append(ci)

    for _gid, cis in grupo_clases.items():
        if len(cis) > 1:
            for bi in range(n_b):
                model.AddAtMostOne(
                    x[ci, bi, ai] for ci in cis for ai in range(n_a)
                )

    # ── Restriccion 5: una aula no puede tener 2 clases al mismo tiempo ───────
    for bi in range(n_b):
        for ai in range(n_a):
            model.AddAtMostOne(x[ci, bi, ai] for ci in range(n_c))

    # ── Restriccion 6 (configurable): prohibir clases dobles ─────────────────
    # "Clase doble" = misma materia+grupo en dos bloques CONSECUTIVOS del mismo día.
    # Se activa cuando restricciones.permitir_clases_dobles == false.
    restricciones = data.get("restricciones", {})
    if not restricciones.get("permitir_clases_dobles", True):
        # Agrupar índices de bloque por día (en el orden en que aparecen en la lista)
        dia_bis = {}
        for bi, b in enumerate(bloques):
            dia_bis.setdefault(b["dia"], []).append(bi)

        # Pares de bloques consecutivos dentro del mismo día
        consec_pairs = []
        for bis in dia_bis.values():
            for k in range(len(bis) - 1):
                consec_pairs.append((bis[k], bis[k + 1]))

        # Para cada grupo, para cada materia con ≥2 clases asignadas:
        # la suma de variables en bi1 + suma en bi2 ≤ 1  (no pueden coexistir)
        for _gid, gcis in grupo_clases.items():
            mat_cis = {}
            for ci in gcis:
                mat_cis.setdefault(clases[ci]["materia"], []).append(ci)

            for _mat, mcis in mat_cis.items():
                if len(mcis) >= 2:
                    for bi1, bi2 in consec_pairs:
                        at1 = [x[ci, bi1, ai] for ci in mcis for ai in range(n_a)]
                        at2 = [x[ci, bi2, ai] for ci in mcis for ai in range(n_a)]
                        if at1 and at2:
                            model.Add(sum(at1) + sum(at2) <= 1)

    # ── Resolver ──────────────────────────────────────────────────────────────
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0  # timeout de seguridad
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        horario = []
        for ci, c in enumerate(clases):
            for bi, b in enumerate(bloques):
                for ai, a in enumerate(aulas):
                    if solver.Value(x[ci, bi, ai]) == 1:
                        horario.append({
                            "clase_id":    c["id"],
                            "materia":     c["materia"],
                            "profesor_id": c["profesor_id"],
                            "grupo_id":    c["grupo_id"],
                            "bloque_id":   b["id"],
                            "dia":         b["dia"],
                            "hora":        b["hora"],
                            "aula_id":     a["id"],
                            "aula_nombre": a["nombre"],
                        })
        return {"status": "FEASIBLE", "horario": horario}

    return {
        "status": "INFEASIBLE",
        "horario": [],
        "message": (
            "No se pudo encontrar un horario válido con las restricciones "
            "actuales. Revisa: cantidad de bloques vs clases, disponibilidad "
            "de aulas por tipo y conflictos de profesores."
        ),
    }


if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"status": "ERROR", "message": "Sin datos de entrada", "horario": []}))
        sys.exit(1)
    try:
        data = json.loads(raw)
        result = resolver(data)
        print(json.dumps(result, ensure_ascii=False))
    except json.JSONDecodeError as e:
        print(json.dumps({"status": "ERROR", "message": f"JSON inválido: {e}", "horario": []}))
        sys.exit(1)
