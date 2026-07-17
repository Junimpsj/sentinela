def existe_pendente(conn, equipamento_id: int, vulnerabilidade_id: int) -> bool:
    cur = conn.cursor()
    cur.execute(
        """SELECT 1 FROM ocorrencia_vulnerabilidade
           WHERE equipamento_id = %s AND vulnerabilidade_id = %s AND status = 'pendente'
           LIMIT 1""",
        (equipamento_id, vulnerabilidade_id),
    )
    row = cur.fetchone()
    cur.close()
    return row is not None


def insert(conn, equipamento_id: int, vulnerabilidade_id: int, data_deteccao) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO ocorrencia_vulnerabilidade (equipamento_id, vulnerabilidade_id, data_deteccao, status)
           VALUES (%s, %s, %s, 'pendente')""",
        (equipamento_id, vulnerabilidade_id, data_deteccao),
    )
    ocorrencia_id = cur.lastrowid
    cur.close()
    return ocorrencia_id


def get_by_id(conn, ocorrencia_id: int) -> dict | None:
    """Inclui filial_id/departamento_id/empresa_id do equipamento — checagem de escopo."""
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT o.*, eq.filial_id, eq.departamento_id, f.empresa_id
           FROM ocorrencia_vulnerabilidade o
           JOIN equipamento eq ON eq.id = o.equipamento_id
           JOIN filial f ON f.id = eq.filial_id
           WHERE o.id = %s""",
        (ocorrencia_id,),
    )
    row = cur.fetchone()
    cur.close()
    return row


def update_status(conn, ocorrencia_id: int, status: str, data_resolucao) -> None:
    cur = conn.cursor()
    cur.execute(
        "UPDATE ocorrencia_vulnerabilidade SET status = %s, data_resolucao = %s WHERE id = %s",
        (status, data_resolucao, ocorrencia_id),
    )
    cur.close()


def list_by_equipamento(conn, equipamento_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT o.*, v.codigo_cve, v.severidade, v.descricao AS vulnerabilidade_descricao
           FROM ocorrencia_vulnerabilidade o
           JOIN vulnerabilidade v ON v.id = o.vulnerabilidade_id
           WHERE o.equipamento_id = %s
           ORDER BY o.data_deteccao DESC""",
        (equipamento_id,),
    )
    rows = cur.fetchall()
    cur.close()
    return rows


def list_by_scope(
    conn, empresa_id: int, filial_id: int | None = None, departamento_id: int | None = None
) -> list[dict]:
    query = (
        """SELECT o.*, v.codigo_cve, v.severidade, eq.patrimonio
           FROM ocorrencia_vulnerabilidade o
           JOIN equipamento eq ON eq.id = o.equipamento_id
           JOIN filial f ON f.id = eq.filial_id
           JOIN vulnerabilidade v ON v.id = o.vulnerabilidade_id
           WHERE f.empresa_id = %s"""
    )
    params: list = [empresa_id]
    if departamento_id is not None:
        query += " AND eq.departamento_id = %s"
        params.append(departamento_id)
    elif filial_id is not None:
        query += " AND eq.filial_id = %s"
        params.append(filial_id)
    query += " ORDER BY o.data_deteccao DESC"
    cur = conn.cursor(dictionary=True)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    return rows
