export type IWindow = Window & {
    __pca: {
        cfg: {}
        platform: 'web-checkout' | 'app-checkout'
    }
  _isMockingEnabledPromise?: Promise<any>
}