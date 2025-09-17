-- Corrigir saldo do cliente baseado nas transações reais
SELECT recalculate_cashback_balance('11e10dba-8ed0-47fc-91f5-bc88f2aef4ca', '69992254080') as resultado_correcao;