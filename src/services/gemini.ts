import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: 'Transcreva o áudio para o portugues do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando necessário.'
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64
        }
      }
    ]
  })

  if (!response.text) {
    throw new Error('Não foi possível transcrever o áudio')
  }

  return response.text
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT'
    }
  })

  if (!response.embeddings?.[0].values) {
    throw new Error('Não foi possível gerar as embeddings')
  }

  return response.embeddings[0].values
}

export async function generateAnswer(
  question: string,
  transcription: string[]
) {
  const context = transcription.join('\n\n')

  const prompt = `
    Com base no contexto abaixo, responda a pergunta de forma clara e precisa em português do Brasil.

    CONTEXTO:
    ${context}

    PERGUNTA: ${question}

    INSTRUÇÕES:
    - Use apenas o contexto fornecido para responder a pergunta.
    - Se a responta não estiver no contexto, responda "Não sei".
    - Seja claro e objetivo.
    - Mantenha um tom educativo e profissional.
    - Site as referências do contexto se apropriado.
    - Se for citar o contexto, utilize o termo 'Conteudo da Aula'.
  `.trim()

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt
      }
    ]
  })

  if (!response.text) {
    throw new Error('Não foi possível gerar a resposta')
  }

  return response.text
}
