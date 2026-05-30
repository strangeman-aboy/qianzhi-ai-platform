window.QIANZHI_CONFIG = {
    // Member demo default: do not call a backend.
    // When a real backend is ready, set apiBase to its public HTTPS origin.
    // Local Java backend:
    //   apiBase: 'http://127.0.0.1:8080'
    //   apiMode: 'required'
    //   environmentName: '本地 Java 后端'
    //   apiToken: 'only-for-private-staging'
    apiBase: '',
    apiToken: '',

    // auto: use API when /api/health is available, otherwise fall back to local demo data.
    // off: never call API, safest for static cloud demos.
    // required: show an error if API is unavailable.
    apiMode: 'off',

    environmentName: 'member-demo'
};
