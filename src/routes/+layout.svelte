<script>
	import '../styles/global.scss';
	import ConsentPopup from "../components/atoms/ConsentPopup.svelte";
	
	let { children } = $props();
	const siteUrl = 'https://simplesmentesim.com';
	const title = 'Guia da Noiva e newsletter | Simplesmente Sim';
	const description = 'Receba o Guia da Noiva e conteúdos para organizar seu casamento com mais clareza, do planejamento ao altar.';
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Simplesmente Sim',
		url: siteUrl,
		inLanguage: 'pt-BR',
		description,
		publisher: {
			'@type': 'Organization',
			name: 'Simplesmente Sim',
			url: siteUrl,
			logo: `${siteUrl}/logo-header.svg`
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index,follow,max-image-preview:large" />
	<meta name="theme-color" content="#f8eddf" />
	<link rel="canonical" href={`${siteUrl}/`} />
	<link rel="icon" type="image/svg+xml" href="/logo-favicon.svg" />
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="preload" href="/fonts/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/imperial-script-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" as="image" href="/logo-hero.svg" type="image/svg+xml" fetchpriority="high" />

	<meta property="og:locale" content="pt_BR" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Simplesmente Sim" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${siteUrl}/`} />
	<meta property="og:image" content={`${siteUrl}/logo-hero.jpg`} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="3603" />
	<meta property="og:image:height" content="2492" />
	<meta property="og:image:alt" content="Identidade visual do Simplesmente Sim" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`${siteUrl}/logo-hero.jpg`} />
	<script type="application/ld+json">{JSON.stringify(structuredData)}</script>

	<script>
	  // Define dataLayer and the gtag function.
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	
	  // Set default consent to 'denied' as a placeholder
	  // Determine actual values based on your own requirements

		const consent = JSON.parse(window.localStorage.getItem("cookie_consent"))

		if(consent) {
			gtag('consent', 'default', consent)
		} else {	
			gtag('consent', 'default', {
				'ad_storage': 'denied',
				'ad_user_data': 'denied',
				'ad_personalization': 'denied',
				'analytics_storage': 'denied'
			});
		}
	</script>

</svelte:head>

<ConsentPopup />
{@render children()}
