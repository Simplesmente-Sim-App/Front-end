<script lang="ts">
  import { onMount } from "svelte";

  let visible = false;

  const STORAGE_KEY = "cookie_consent";

  function loadGoogleTagManager() {
    if (document.getElementById('google-tag-manager')) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.id = 'google-tag-manager';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-W5GCLB27';
    document.head.appendChild(script);
  }

  onMount(() => {
    const consent = localStorage.getItem(STORAGE_KEY);

    if (!consent) {
      setTimeout(() => {
        visible = true;
      }, 500);
	} else {
	  try {
	    if (JSON.parse(consent).analytics_storage === 'granted') loadGoogleTagManager();
	  } catch {
	    localStorage.removeItem(STORAGE_KEY);
	    visible = true;
	  }
    }
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ad_storage: 'granted',
	  ad_user_data: 'granted',
	  ad_personalization: 'granted',
      analytics_storage: 'granted'
    }));
    visible = false;
    gtag('consent', 'update', {
      ad_storage: 'granted',
	  ad_user_data: 'granted',
	  ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
	loadGoogleTagManager();
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ad_storage: 'denied',
	  ad_user_data: 'denied',
	  ad_personalization: 'denied',
      analytics_storage: 'denied'
    }));
    visible = false;
  }

</script>

{#if visible}
  <div class="consent" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-description">
    <div class="consent__box">

      <div class="consent__content">
        <h2 id="cookie-title">Preferências de cookies</h2>

        <p id="cookie-description">
          Usamos cookies de análise para entender como o site é utilizado. Você pode aceitar ou recusar.
        </p>
      </div>

      <div class="consent__actions">
        <button type="button" class="consent__button consent__button--decline" onclick={decline}>
          Recusar
        </button>

        <button type="button" class="consent__button consent__button--accept" onclick={accept}>
          Aceitar
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  .consent {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;

    animation: slide-up 0.4s ease;
  }

  .consent__box {
    background: white;
    border-radius: 12px;
    padding: 18px 20px;

    width: min(420px, 90vw);

    box-shadow:
      0 10px 25px rgba(0,0,0,0.15),
      0 4px 10px rgba(0,0,0,0.1);
  }

  .consent__content h2 {
    margin: 0 0 6px;
    font-size: 18px;
  }

  .consent__content p {
    margin: 0;
    font-size: 14px;
    color: #555;
  }

  .consent__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }

  .consent__button {
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
  }

  .consent__button--decline {
    background: transparent;
    font-size: 12px;
  }

  .consent__button--accept {
    background: #84000b;
    color: white;
    font-size: 14px;
  }

  .consent__button:hover {
    opacity: 0.9;
  }

  .consent__button:focus-visible {
    outline: 2px solid #84000b;
    outline-offset: 2px;
  }

  @keyframes slide-up {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
</style>
