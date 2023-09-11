import { describe, expect, it } from 'bun:test'
import Elysia from 'elysia'
import { i18next } from './index.ts'
import { InitOptions } from 'i18next'

export const req = (path: string, requestInit?: RequestInit) =>
  new Request(`http://localhost${path}`, requestInit)

describe('i18next', () => {
  const initOptions: InitOptions = {
    lng: 'nl',
    resources: {
      nl: {
        translation: {
          greeting: 'Hallo!',
        },
      },
      en: {
        translation: {
          greeting: 'Hello!',
        },
      },
      fr: {
        translation: {
          greeting: 'Bonjour!',
        },
      },
    },
    fallbackLng: false,
  }
  it('translates', async () => {
    const app = new Elysia()
      .use(i18next({ initOptions }))
      .get('/', ({ t }) => t('greeting'))

    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hallo!')
  })

  it('changes language based on accept-language header', async () => {
    const app = new Elysia()
      .use(i18next({ initOptions }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(
      req('/', { headers: { 'accept-language': 'en' } })
    )
    expect(await response.text()).toEqual('Hello!')
  })

  it('changes language based on property in store', async () => {
    const app = new Elysia()
      .state('language', 'en')
      .use(i18next({ initOptions }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hello!')
  })

  it('allows to override language detection', async () => {
    const app = new Elysia()
      .use(i18next({ initOptions, detectLanguage: () => 'fr' }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Bonjour!')
  })
})