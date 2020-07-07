export type Stage = 'dev' | 'prod'

export const getStage = (): Stage => {
  const stage = (process.env['STAGE'] || 'dev') as Stage
  if (!['dev', 'prod'].includes(stage)) throw new Error('Invalid stage')
  return stage
}
