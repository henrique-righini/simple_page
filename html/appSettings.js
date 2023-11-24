(function () {
    "use strict";

    /**
     * /**
     * @ngdoc constant
     * @name arq-spa-base.recursos.constants:app.config
     * @module arq-spa-base.recursos
     * 
     * @description
     * Constantes que armazenam as configurações da aplicação.
     */
    angular.module("arq-spa-base.recursos").constant("appSettings", {
        mfa: {
            challenges: [
                {
                    name: "token",
                    journey: "mfaToken"
                },
                {
                    name: "senha",
                    journey: "mfaSenha"
                },
                {
                    name: "retry",
                    journey: "mfaRetry"
                },
                {
                    name: "block",
                    journey: "mfaBlock"
                },
                {
                    name: "sms",
                    journey: "mfaSms"
                },
                {
                    name: "email",
                    journey: "mfaEmail"
                },
                {
                    name: "kba",
                    journey: "mfaKba"
                }
            ]
        },
        configuracao: {
            urlLandingPageFpg: "https://www.safra.com.br/servicos/pessoa-fisica/conta-salario.htm?origem-campain=MBF",
            urlAbraSuaConta: "https://www.safra.com.br/pessoa-fisica/conta-corrente/abra-sua-conta.htm?utm_source=app&utm_medium=botao&utm_campaign=abra_sua_conta&utm_content=home_app",
            urlScriptGoogleMaps: "https://maps.googleapis.com/maps/api/js?key=AIzaSyCtA7Ty3RAYaen5m90iNZi44SIGtFnDXns&language=pt-BR&callback=initMap",
            caminhoCatalagoInternacionalizacao: "./app/assets/config/internacionalizacoes.json",
            caminhoArquivoConfigContexto: "./app/assets/config/contexto.json",
            caminhoCatalogoDependencias: "./app/assets/config/dependencias.json",
            caminhoDefinicoesFiltros: "./app/assets/config/filtros.json",
            caminhoArquivosModulos: "./app/assets/js/",
            caminhoAssets: {
                banking: "./app/assets/@BANKING",
                credito: "./app/assets/@CREDITO",
                cartoes: "./app/assets/@CARTOES",
                core: "./app/assets/@CORE",
                investimentos: "./app/assets/@INVESTIMENTOS",
                comum: "./app/assets",
                onboarding: "./app/assets/@ONBOARDING",
                comumMod: "./app/assets/@COMUM"
            },
            expressaoRegularCaracteresEspeciais: "^(?:[\\.>(+|&!$*);,%<?`:#@'=~{}\\-\/\\\sa-zA-Z0-9])*$",
            urlScriptGoogleAnalytics: "https://www.google-analytics.com/analytics.js",
            caminhoGoogleAnalyticsConfig: "./app/assets/config/googleAnalyticsConfig.js",
            urlAdobeAnalytics: "https://assets.adobedtm.com/232caedc0ec1/6d9b1949c5e7/launch-be229ec21b29.min.js",
            quantidadeMaxRepresamentoLog: 50,
            parametroDataRelatorioData: {mes: "12", ano: "2035"},
            campanhas: true,
            urlPluginAndroid: [
                {
                    versaoMinimaContainer: "5.0.6",
                    urlVersaoCompativel: "https://bcdn-god.we-stats.com/scripts/72a2876f/slave.min.js",
                    urlVersaoIncompativel: "https://bcdn-god.we-stats.com/scripts/72a2876f/72a2876f.js"
                }],
            urlPluginIos: [
                {
                    versaoMinimaContainer: "4.6.2",
                    urlVersaoCompativel: ["https://bcdn-god.we-stats.com/scripts/72a2876f/slave.min.js",
                        "https://bcdn-god.we-stats.com/scripts/72a2876f/jsBridge.js"],
                    urlVersaoIncompativel: "https://bcdn-god.we-stats.com/scripts/72a2876f/72a2876f.js"
            }],
            memorizador: {
                prefixo: "sfrMobilePF",
                expiracao: 0
            },
            tratamentoExcecao: {
                servico: "tratarExcecao",
                funcao: "tratarErro"
            },
            seguranca: {
                urlWhiteList: [],
                consoleIntercept: true
            },
            limparContextoTrabalhoLogoff: true,
            criptografia: {
                habilitada: true,
                numeroMaximoTentativas: 5
            },
            localizacao: {
                timezone: "America/Sao_Paulo",
                local: "pt-br",
                customizacaoLocal: undefined //caso exista alguma configuração na regionalização para o local, deve ser incluído um objeto.
            },
            versaoRelease: 2,
            aplicacao: "MBF",
            padraoLogarInformativo: false,
            logFrontEndOrigem: ["logBodyXHR"],
            menu: {
                lateral: "principal",
                home: "iniciar"
            },
            byPassRegraPrimeiroDispositivo: false,
            byPassInstalacaoToken: false,
            versaoMinimaContainerSamsungPay: "1.40.0",
            versaoMinimaContainerAndroid: {
                versao: "5.0.10",
                tipo: "android"
            },
            versaoMinimaContainerIOS: {
                versao: "4.6.2",
                tipo: "ios"
            },
            versaoAtualLojaAndroid: {
                versao: "5.0.11",
                tipo: "android",
                data: new Date(2023, 10, 10)
            },
            versaoAtualLojaIOS: {
                versao: "4.6.4",
                tipo: "ios",
                data: new Date(2023, 10, 10)
            },
            urlStore: {
                android: "http://play.google.com/store/apps/details?id=br.livetouch.safra.net",
                ios: "https://apps.apple.com/br/app/safra/id422705275"
            },
            urlStoreFGTS: {
                android: "https://play.google.com/store/apps/details?id=br.gov.caixa.fgts.trabalhador&hl=pt_BR&gl=US",
                ios: "https://apps.apple.com/br/app/fgts/id1038441027"
            },
            urlPlayStore: "http://play.google.com/store/apps/details?id=br.livetouch.safra.net",
            dataBase: new Date(),
            urlHomebroker: "https://negociacao.safracorretora.com.br/hbnet2/IntegracaoPortalHBSafra/IntegracaoPortalHBSafra.aspx",
            urlOpenBankingConsentimento: "https://cbs.safra.com.br/transmissora",
            urlOpenBankingConsentimentoHome: "https://cbs.safra.com.br/home",
            urlOpenBankingConsentimentoReceptora: "https://cbs.safra.com.br/receptora-confirmacao",
            urlConsolidadorGastos:"https://cif.safra.com.br/apl-web-cif/#/home?id=",
            urlOpenBankingReceptoraSimples: "https://cbs.safra.com.br/receptora-simples",
            urlOpenInsuranceHome: "https://ws.safra.com.br/open-insurance/apl-web-consentimento/home",
            urlOpenInsuranceConsentimento: "https://ws.safra.com.br/open-insurance/apl-web-consentimento/transmissora",
            urlDynatrace: "app/assets/config/dynatrace.js",
            versaoPltAndroid: "3.0.0",
            versaoPltIos: "3.0.0",
            sistemaIndisponivel: false
        },
        comunicacao: {
            urlBackend: "https://apiext-bi.safra.com.br/mbf",
            urlContainer: "http://localhost:8080/periferico",
            endpointUrlContainer: "/periferico",
            urlLog: "https://apiext-bi.safra.com.br/log",
            urlUpdate: "https://staticext-bi.safra.com.br/dist/apl-mobile-pf/updateCenter.json",
            timeoutPadrao: 360000,
            timeoutsEspecificos: [
                { dominio: "/download-lumis-externo", timeout: 8000 },
                { dominio: "/pix/get-transferencia-resultado-end-to-end", timeout: 10000 },
                { dominio: "/pix/transferencia-confirmar", timeout: 10000 },
                { dominio: "/pix/transferencia-confirmar-derivada", timeout: 10000 },
                { dominio: "/campanha-cliente", timeout: 8000 },
                { dominio: "/consultar-cartoes-ativos", timeout: 1000 },
                { dominio: "/listar-cartoes", timeout: 1000 },
                { dominio: "/periferico/", timeout: 900000 },
                { dominio: "/geolocation", timeout: 300 },
                { dominio: "/facecheck", timeout: 900000 }
            ],
            obterGeolocationContainer: true,
            obterTipoConexaoContainer: true
        },
        navegacao: {
            fluxoInicial: "apl-mobile-pf-inicio",
            timeoutPadrao: 360000
        },
        customLoader: true,
        tipoSpinner: {
            gif: true, //Manter true caso for usar GIF
            elementoLoader: "loadermbfapp",
            spinner: {
                elementHeight: "24px",
                elementWidth: "24px",
                top: "12px",
                left: "12px",
                position: "relative",
                zIndex: null,
                length: 4,
                width: 3,
                radius: 6,
                color: "#555"
            },
            loader: {
                color: "white"
            }
        },
        loaderRing: true,
        blipChat: {
            apiKey: "YXV0b3NzZXJ2aWNvcGY6Y2QzMzMzYmMtMjk4YS00M2U3LThhMTAtOWE2ZTBmZjljOTlk"
        },
        cxpPush: {
            Oracle: {
                metodoAtivarDispositivo: "POST",
                endpointAtivarDispositivo: "push-notification/cadastro-dispositivo"
            },
            Adobe: true,
            CXP: {
                endpointAtivarDispositivo: "push-notification/cadastro-dispositivo-cxp-psn"
            }
        }
    });
})();