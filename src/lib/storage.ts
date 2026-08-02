import { randomUUID } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const maxFileSize = 10 * 1024 * 1024
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])

function getClient() {
  const endpoint = process.env.S3_ENDPOINT
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!(endpoint && accessKeyId && secretAccessKey)) {
    throw new Error('Armazenamento de anexos não está configurado.')
  }

  return new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export async function createUploadUrl(input: {
  userId: string
  contentType: string
  size: number
}) {
  if (!allowedMimeTypes.has(input.contentType) || input.size > maxFileSize) {
    throw new Error('Envie um PDF, PNG ou JPEG de até 10 MB.')
  }

  const bucket = process.env.S3_BUCKET
  if (!bucket) throw new Error('Armazenamento de anexos não está configurado.')

  const key = `users/${input.userId}/attachments/${randomUUID()}`
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
  })

  return {
    key,
    uploadUrl: await getSignedUrl(getClient(), command, { expiresIn: 300 }),
  }
}
