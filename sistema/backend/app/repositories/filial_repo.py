def insert(conn, empresa_id: int, nome: str, cidade: str, uf: str, endereco: str) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO filial (empresa_id, nome, cidade, uf, endereco) VALUES (%s, %s, %s, %s, %s)",
        (empresa_id, nome, cidade, uf, endereco),
    )
    filial_id = cur.lastrowid
    cur.close()
    return filial_id


def get_by_id(conn, filial_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM filial WHERE id = %s", (filial_id,))
    row = cur.fetchone()
    cur.close()
    return row


def list_by_empresa(conn, empresa_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM filial WHERE empresa_id = %s ORDER BY nome", (empresa_id,))
    rows = cur.fetchall()
    cur.close()
    return rows
