def insert(
    conn,
    software_id: int | None,
    componente_modelo_id: int | None,
    codigo_cve: str,
    severidade: str,
    descricao: str,
) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO vulnerabilidade (software_id, componente_modelo_id, codigo_cve, severidade, descricao)
           VALUES (%s, %s, %s, %s, %s)""",
        (software_id, componente_modelo_id, codigo_cve, severidade, descricao),
    )
    vulnerabilidade_id = cur.lastrowid
    cur.close()
    return vulnerabilidade_id


def get_by_id(conn, vulnerabilidade_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM vulnerabilidade WHERE id = %s", (vulnerabilidade_id,))
    row = cur.fetchone()
    cur.close()
    return row


def list_all(conn, software_id: int | None = None, componente_modelo_id: int | None = None) -> list[dict]:
    query = "SELECT * FROM vulnerabilidade WHERE 1=1"
    params: list = []
    if software_id is not None:
        query += " AND software_id = %s"
        params.append(software_id)
    if componente_modelo_id is not None:
        query += " AND componente_modelo_id = %s"
        params.append(componente_modelo_id)
    query += " ORDER BY severidade DESC, codigo_cve"
    cur = conn.cursor(dictionary=True)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    return rows
