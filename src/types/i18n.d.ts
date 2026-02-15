import type { MessageSchema } from '@/locales'

// Extender para type-safety completo
declare module 'vue-i18n' {
  import type { DefineLocaleMessage } from 'vue-i18n'
  
  export interface DefineLocaleMessage extends MessageSchema {}
}

// Extender ComponentCustomProperties para templates
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string
    $d: (value: Date | number, key?: string) => string
    $n: (value: number, key?: string) => string
  }
}
