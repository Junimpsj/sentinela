from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling

from app.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER

_pool = pooling.MySQLConnectionPool(
    pool_name="sentinela_pool",
    pool_size=10,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    autocommit=True,
)


@contextmanager
def get_connection():
    """Conexão avulsa, autocommit ligado — uso em leituras e escritas de 1 statement."""
    conn: mysql.connector.MySQLConnection = _pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_transaction():
    """Conexão com transação explícita — commit no sucesso, rollback em exceção.

    Uso obrigatório para operações multi-statement que precisam ser atômicas
    (troca de componente, movimentação de equipamento — decisões 3 e 7).
    """
    conn: mysql.connector.MySQLConnection = _pool.get_connection()
    conn.autocommit = False
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.autocommit = True
        conn.close()
