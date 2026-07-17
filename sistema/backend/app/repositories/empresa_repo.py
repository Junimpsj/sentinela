def insert(conn, razao_social: str, cnpj: str, email: str) -> int:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO empresa (razao_social, cnpj, email) VALUES (%s, %s, %s)",
        (razao_social, cnpj, email),
    )
    empresa_id = cur.lastrowid
    cur.close()
    return empresa_id


def get_by_id(conn, empresa_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM empresa WHERE id = %s", (empresa_id,))
    row = cur.fetchone()
    cur.close()
    return row
