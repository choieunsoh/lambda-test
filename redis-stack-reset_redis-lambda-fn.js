'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const redis = require('redis');
const util = require('util');
const KEY = `account1/balance`;
const DEFAULT_BALANCE = 100;
const MAX_EXPIRATION = 60 * 60 * 24 * 30;

exports.resetRedis = async function () {
  const redisClient = await getRedisClient();
  const ret = new Promise((resolve, reject) => {
    redisClient.set(KEY, String(DEFAULT_BALANCE), 'EX', MAX_EXPIRATION, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(DEFAULT_BALANCE);
      }
    });
  });
  await disconnectRedis(redisClient);
  return ret;
};

async function getRedisClient() {
  return new Promise((resolve, reject) => {
    try {
      const client = new redis.RedisClient({
        host: process.env.ENDPOINT,
        port: parseInt(process.env.PORT || '6379'),
      });
      client.on('ready', () => {
        console.log('redis client ready');
        resolve(client);
      });
    } catch (error) {
      reject(error);
    }
  });
}
async function disconnectRedis(client) {
  return new Promise((resolve, reject) => {
    client.quit((error, res) => {
      if (error) {
        reject(error);
      } else if (res == 'OK') {
        console.log('redis client disconnected');
        resolve(res);
      } else {
        reject('unknown error closing redis connection.');
      }
    });
  });
}
