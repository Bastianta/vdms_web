import json
import logging
import os
from datetime import date, datetime
from decimal import Decimal

from google.cloud.logging import Client


class Logger:

    def __init__(self):
        self.__logger = logging.getLogger(name='oden')

    def debug(self, message):
        self.__logger.debug(message)

    def info(self, message):
        self.__logger.info(message)

    def warning(self, message):
        self.__logger.warning(message)

    def error(self, message):
        self.__logger.error(message)

    def critical(self, message):
        self.__logger.critical(message)


class JSONEncoder(json.JSONEncoder):

    def default(self, value):
        if isinstance(value, Decimal):
            return float(value)
        elif isinstance(value, date):
            return value.isoformat()
        elif isinstance(value, datetime):
            return value.isoformat()
        return super().default(value)


if not os.environ.get('SSH_CONNECTION'):
    if __name__ == 'main':
        client = Client()
        client.setup_logging(json_encoder_cls=JSONEncoder)

Log = Logger()
