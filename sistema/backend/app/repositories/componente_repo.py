def insert(
    conn,
    equipamento_id: int,
    modelo_componente_id: int,
    manutencao_id: int | None,
    status: str,
    data_instalacao,
) -> int:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO componente (equipamento_id, modelo_componente_id, manutencao_id, status, data_instalacao)
           VALUES (%s, %s, %s, %s, %s)""",
        (equipamento_id, modelo_componente_id, manutencao_id, status, data_instalacao),
    )
    componente_id = cur.lastrowid
    cur.close()
    return componente_id


def marcar_substituido(conn, componente_id: int, data_remocao) -> None:
    cur = conn.cursor()
    cur.execute(
        "UPDATE componente SET status = 'substituido', data_remocao = %s WHERE id = %s",
        (data_remocao, componente_id),
    )
    cur.close()


def get_by_id(conn, componente_id: int) -> dict | None:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM componente WHERE id = %s", (componente_id,))
    row = cur.fetchone()
    cur.close()
    return row


def list_by_equipamento(conn, equipamento_id: int) -> list[dict]:
    """Ativos e substituídos — alimenta o histórico da tela de detalhe (RF09, RF21)."""
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """SELECT c.*, m.tipo AS modelo_tipo, m.fabricante AS modelo_fabricante, m.modelo AS modelo_nome
           FROM componente c
           JOIN modelo_componente m ON m.id = c.modelo_componente_id
           WHERE c.equipamento_id = %s
           ORDER BY c.data_instalacao DESC""",
        (equipamento_id,),
    )
    rows = cur.fetchall()
    cur.close()
    return rows


def list_equipamentos_com_modelo_ativo(conn, modelo_componente_id: int) -> list[int]:
    """Equipamentos com componente ativo desse modelo — usado pelo motor de detecção (decisão 4)."""
    cur = conn.cursor()
    cur.execute(
        "SELECT DISTINCT equipamento_id FROM componente WHERE modelo_componente_id = %s AND status = 'ativo'",
        (modelo_componente_id,),
    )
    ids = [row[0] for row in cur.fetchall()]
    cur.close()
    return ids
