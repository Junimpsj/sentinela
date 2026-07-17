def insert(conn, filial_id: int, nome: str) -> int:
    cur = conn.cursor()
    cur.execute("INSERT INTO departamento (filial_id, nome) VALUES (%s, %s)", (filial_id, nome))
    departamento_id = cur.lastrowid
    cur.close()
    return departamento_id


def get_by_id(conn, departamento_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM departamento WHERE id = %s", (departamento_id,))
    row = cur.fetchone()
    cur.close()
    return row


def list_by_filial(conn, filial_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM departamento WHERE filial_id = %s ORDER BY nome", (filial_id,))
    rows = cur.fetchall()
    cur.close()
    return rows
