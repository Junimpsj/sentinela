def insert(
    conn,
    empresa_id: int,
    filial_id: int | None,
    departamento_id: int | None,
    nome: str,
    email: str,
    senha_hash: str,
    tipo_acesso: str,
) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO usuario (empresa_id, filial_id, departamento_id, nome, email, senha, tipo_acesso)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (empresa_id, filial_id, departamento_id, nome, email, senha_hash, tipo_acesso),
    )
    usuario_id = cur.lastrowid
    cur.close()
    return usuario_id


def get_by_email(conn, email: str) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM usuario WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    return row


def list_by_scope(
    conn, empresa_id: int, filial_id: int | None = None, departamento_id: int | None = None
) -> list[dict]:
    query = (
        "SELECT id, empresa_id, filial_id, departamento_id, nome, email, tipo_acesso, criado_em "
        "FROM usuario WHERE empresa_id = %s"
    )
    params: list = [empresa_id]
    if departamento_id is not None:
        query += " AND departamento_id = %s"
        params.append(departamento_id)
    elif filial_id is not None:
        query += " AND filial_id = %s"
        params.append(filial_id)
    query += " ORDER BY nome"
    cur = conn.cursor(dictionary=True)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    return rows
