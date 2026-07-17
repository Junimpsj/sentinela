def insert(
    conn,
    filial_id: int,
    departamento_id: int | None,
    tipo: str,
    patrimonio: str,
    hostname: str | None,
    endereco_ip: str | None,
) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO equipamento (filial_id, departamento_id, tipo, patrimonio, hostname, endereco_ip)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (filial_id, departamento_id, tipo, patrimonio, hostname, endereco_ip),
    )
    equipamento_id = cur.lastrowid
    cur.close()
    return equipamento_id


def get_by_id(conn, equipamento_id: int) -> dict | None:
    """Inclui empresa_id (via join com filial) — necessário pra checagem de escopo."""
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT e.*, f.empresa_id
           FROM equipamento e
           JOIN filial f ON f.id = e.filial_id
           WHERE e.id = %s""",
        (equipamento_id,),
    )
    row = cur.fetchone()
    cur.close()
    return row


def list_by_scope(
    conn,
    empresa_id: int,
    filial_id: int | None = None,
    departamento_id: int | None = None,
    tipo: str | None = None,
    status: str | None = None,
) -> list[dict]:
    query = (
        "SELECT e.*, f.empresa_id FROM equipamento e "
        "JOIN filial f ON f.id = e.filial_id "
        "WHERE f.empresa_id = %s"
    )
    params: list = [empresa_id]
    if departamento_id is not None:
        query += " AND e.departamento_id = %s"
        params.append(departamento_id)
    elif filial_id is not None:
        query += " AND e.filial_id = %s"
        params.append(filial_id)
    if tipo is not None:
        query += " AND e.tipo = %s"
        params.append(tipo)
    if status is not None:
        query += " AND e.status = %s"
        params.append(status)
    query += " ORDER BY e.patrimonio"
    cur = conn.cursor(dictionary=True)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    return rows


def update_departamento(conn, equipamento_id: int, departamento_id: int) -> None:
    cur = conn.cursor()
    cur.execute(
        "UPDATE equipamento SET departamento_id = %s WHERE id = %s",
        (departamento_id, equipamento_id),
    )
    cur.close()
