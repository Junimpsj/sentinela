def insert(conn, equipamento_id: int, data, descricao: str, status: str = "aberta") -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO manutencao (equipamento_id, data, descricao, status) VALUES (%s, %s, %s, %s)",
        (equipamento_id, data, descricao, status),
    )
    manutencao_id = cur.lastrowid
    cur.close()
    return manutencao_id


def get_by_id(conn, manutencao_id: int) -> dict | None:
    """Inclui filial_id/departamento_id/empresa_id do equipamento — checagem de escopo."""
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT mn.*, eq.filial_id, eq.departamento_id, f.empresa_id
           FROM manutencao mn
           JOIN equipamento eq ON eq.id = mn.equipamento_id
           JOIN filial f ON f.id = eq.filial_id
           WHERE mn.id = %s""",
        (manutencao_id,),
    )
    row = cur.fetchone()
    cur.close()
    return row


def update_status(conn, manutencao_id: int, status: str) -> None:
    cur = conn.cursor()
    cur.execute("UPDATE manutencao SET status = %s WHERE id = %s", (status, manutencao_id))
    cur.close()


def list_by_equipamento(conn, equipamento_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT * FROM manutencao WHERE equipamento_id = %s ORDER BY data DESC", (equipamento_id,)
    )
    rows = cur.fetchall()
    cur.close()
    return rows
