def _scope_where(filial_id: int | None, departamento_id: int | None) -> tuple[str, list]:
    if departamento_id is not None:
        return " AND eq.departamento_id = %s", [departamento_id]
    if filial_id is not None:
        return " AND eq.filial_id = %s", [filial_id]
    return "", []


def resumo(conn, empresa_id: int, filial_id: int | None = None, departamento_id: int | None = None) -> dict:
    scope_sql, scope_params = _scope_where(filial_id, departamento_id)
    cur = conn.cursor(dictionary=True)

    cur.execute(
        f"""SELECT
                COUNT(*) AS total,
                SUM(eq.status = 'ativo') AS ativos,
                SUM(eq.status = 'manutencao') AS em_manutencao,
                SUM(eq.status = 'inativo') AS inativos
            FROM equipamento eq
            JOIN filial f ON f.id = eq.filial_id
            WHERE f.empresa_id = %s{scope_sql}""",
        (empresa_id, *scope_params),
    )
    equipamentos = cur.fetchone()

    cur.execute(
        f"""SELECT
                COUNT(*) AS pendentes,
                SUM(v.severidade = 'critica') AS pendentes_criticas
            FROM ocorrencia_vulnerabilidade o
            JOIN equipamento eq ON eq.id = o.equipamento_id
            JOIN filial f ON f.id = eq.filial_id
            JOIN vulnerabilidade v ON v.id = o.vulnerabilidade_id
            WHERE f.empresa_id = %s AND o.status = 'pendente'{scope_sql}""",
        (empresa_id, *scope_params),
    )
    ocorrencias = cur.fetchone()

    cur.execute(
        f"""SELECT COUNT(*) AS abertas
            FROM manutencao mn
            JOIN equipamento eq ON eq.id = mn.equipamento_id
            JOIN filial f ON f.id = eq.filial_id
            WHERE f.empresa_id = %s AND mn.status = 'aberta'{scope_sql}""",
        (empresa_id, *scope_params),
    )
    manutencoes = cur.fetchone()

    cur.close()
    return {
        "equipamentos_total": equipamentos["total"] or 0,
        "equipamentos_ativos": int(equipamentos["ativos"] or 0),
        "equipamentos_em_manutencao": int(equipamentos["em_manutencao"] or 0),
        "equipamentos_inativos": int(equipamentos["inativos"] or 0),
        "ocorrencias_pendentes": ocorrencias["pendentes"] or 0,
        "ocorrencias_pendentes_criticas": int(ocorrencias["pendentes_criticas"] or 0),
        "manutencoes_abertas": manutencoes["abertas"] or 0,
    }


def mapa_exposicao_por_filial(conn, empresa_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT f.id AS filial_id, f.nome AS filial_nome,
                COUNT(o.id) AS pendentes,
                SUM(v.severidade = 'critica') AS pendentes_criticas
           FROM filial f
           LEFT JOIN equipamento eq ON eq.filial_id = f.id
           LEFT JOIN ocorrencia_vulnerabilidade o
               ON o.equipamento_id = eq.id AND o.status = 'pendente'
           LEFT JOIN vulnerabilidade v ON v.id = o.vulnerabilidade_id
           WHERE f.empresa_id = %s
           GROUP BY f.id, f.nome
           ORDER BY f.nome""",
        (empresa_id,),
    )
    rows = cur.fetchall()
    cur.close()
    for row in rows:
        row["pendentes_criticas"] = int(row["pendentes_criticas"] or 0)
    return rows


def mapa_exposicao_por_departamento(conn, filial_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT d.id AS departamento_id, d.nome AS departamento_nome,
                COUNT(o.id) AS pendentes,
                SUM(v.severidade = 'critica') AS pendentes_criticas
           FROM departamento d
           LEFT JOIN equipamento eq ON eq.departamento_id = d.id
           LEFT JOIN ocorrencia_vulnerabilidade o
               ON o.equipamento_id = eq.id AND o.status = 'pendente'
           LEFT JOIN vulnerabilidade v ON v.id = o.vulnerabilidade_id
           WHERE d.filial_id = %s
           GROUP BY d.id, d.nome
           ORDER BY d.nome""",
        (filial_id,),
    )
    rows = cur.fetchall()
    cur.close()
    for row in rows:
        row["pendentes_criticas"] = int(row["pendentes_criticas"] or 0)
    return rows
