<script>
	import favicon from '$lib/assets/favicon.ico';
	import '../styles/global.scss';
	import ConsentPopup from "../components/atoms/ConsentPopup.svelte";
	
	let { children } = $props();
</script>

<svelte:head>
	<title>Simplesmente Sim - Organize seu casamento sem planilhas.</title>
	<link rel="icon" href={favicon} />

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

	<!-- Google Tag Manager -->
	<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','GTM-W5GCLB27');</script>
	<!-- End Google Tag Manager -->

</svelte:head>

	<!-- Google Tag Manager (noscript) -->
<noscript>
	<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W5GCLB27"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->

<ConsentPopup />
{@render children()};
