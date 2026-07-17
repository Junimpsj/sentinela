def insert(conn, equipamento_id: int, origem_id: int, destino_id: int, data, motivo: str | None) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO movimentacao_equipamento
           (equipamento_id, departamento_origem_id, departamento_destino_id, data, motivo)
           VALUES (%s, %s, %s, %s, %s)""",
        (equipamento_id, origem_id, destino_id, data, motivo),
    )
    row_id = cur.lastrowid
    cur.close()
    return row_id


def list_by_equipamento(conn, equipamento_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT mv.*, do.nome AS origem_nome, dd.nome AS destino_nome
           FROM movimentacao_equipamento mv
           JOIN departamento do ON do.id = mv.departamento_origem_id
           JOIN departamento dd ON dd.id = mv.departamento_destino_id
           WHERE mv.equipamento_id = %s
           ORDER BY mv.data DESC""",
        (equipamento_id,),
    )
    rows = cur.fetchall()
    cur.close()
    return rows
