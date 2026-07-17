def list_all(conn) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM modelo_componente ORDER BY tipo, fabricante, modelo")
    rows = cur.fetchall()
    cur.close()
    return rows


def get_by_id(conn, modelo_componente_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM modelo_componente WHERE id = %s", (modelo_componente_id,))
    row = cur.fetchone()
    cur.close()
    return row


def get_by_natural_key(conn, tipo: str, fabricante: str, modelo: str) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT * FROM modelo_componente WHERE tipo = %s AND fabricante = %s AND modelo = %s",
        (tipo, fabricante, modelo),
    )
    row = cur.fetchone()
    cur.close()
    return row


def insert(conn, tipo: str, fabricante: str, modelo: str) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO modelo_componente (tipo, fabricante, modelo) VALUES (%s, %s, %s)",
        (tipo, fabricante, modelo),
    )
    modelo_componente_id = cur.lastrowid
    cur.close()
    return modelo_componente_id
