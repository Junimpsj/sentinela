def insert(
    conn,
    equipamento_id: int,
    software_id: int,
    data_instalacao,
    chave_licenca: str | None,
    validade_licenca,
) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO equipamento_software (equipamento_id, software_id, data_instalacao, chave_licenca, validade_licenca)
           VALUES (%s, %s, %s, %s, %s)""",
        (equipamento_id, software_id, data_instalacao, chave_licenca, validade_licenca),
    )
    row_id = cur.lastrowid
    cur.close()
    return row_id


def list_equipamentos_com_software(conn, software_id: int) -> list[int]:
    """Equipamentos com esse software instalado — usado pelo motor de detecção (decisão 4)."""
    cur = conn.cursor()
    cur.execute(
        "SELECT DISTINCT equipamento_id FROM equipamento_software WHERE software_id = %s",
        (software_id,),
    )
    ids = [row[0] for row in cur.fetchall()]
    cur.close()
    return ids


def list_by_equipamento(conn, equipamento_id: int) -> list[dict]:
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT es.*, s.nome AS software_nome, s.fabricante AS software_fabricante, s.versao AS software_versao
           FROM equipamento_software es
           JOIN software s ON s.id = es.software_id
           WHERE es.equipamento_id = %s
           ORDER BY es.data_instalacao DESC""",
        (equipamento_id,),
    )
    rows = cur.fetchall()
    cur.close()
    return rows
