def list_all(conn) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM software ORDER BY nome, versao")
    rows = cur.fetchall()
    cur.close()
    return rows


def get_by_id(conn, software_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM software WHERE id = %s", (software_id,))
    row = cur.fetchone()
    cur.close()
    return row


def get_by_natural_key(conn, nome: str, fabricante: str, versao: str) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT * FROM software WHERE nome = %s AND fabricante = %s AND versao = %s",
        (nome, fabricante, versao),
    )
    row = cur.fetchone()
    cur.close()
    return row


def insert(conn, nome: str, fabricante: str, versao: str) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO software (nome, fabricante, versao) VALUES (%s, %s, %s)",
        (nome, fabricante, versao),
    )
    software_id = cur.lastrowid
    cur.close()
    return software_id
