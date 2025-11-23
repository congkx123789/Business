import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecretString(secretId: string): Promise<string> {
  const res = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (res.SecretString) return res.SecretString;
  if (res.SecretBinary) return Buffer.from(res.SecretBinary).toString("utf8");
  throw new Error(`Secret ${secretId} has no value`);
}

export async function getDatabaseCredentials(): Promise<{ username: string; password: string }>{
  const secretId = process.env.DB_SECRET_ID as string;
  if (!secretId) throw new Error("DB_SECRET_ID is not set");
  const payload = await getSecretString(secretId);
  const parsed = JSON.parse(payload);
  return { username: parsed.username, password: parsed.password };
}

