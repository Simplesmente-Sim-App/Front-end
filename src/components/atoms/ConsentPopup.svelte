<script lang="ts">
  import { onMount } from "svelte";

  let visible = false;

  const STORAGE_KEY = "cookie-consent";

  onMount(() => {
    const consent = localStorage.getItem(STORAGE_KEY);

    if (!consent) {
      setTimeout(() => {
        visible = true;
      }, 500);
    }
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    visible = false;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted'
    });
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    visible = false;
  }

</script>

{#if visible}
  <div class="consent">
    <div class="consent__box">

      <div class="consent__content">
        <h3>🍪 Consentimento de Cookies</h3>

        <p>
          Usamos cookies para melhorar sua experiência.
          Isso nos ajuda a entender melhor nossos usuários e criar um produto cada vez melhor.
        </p>
      </div>

      <div class="consent__actions">
        <button class="consent__button consent__button--decline" on:click={decline}>
          Recusar
        </button>

        <button class="consent__button consent__button--accept" on:click={accept}>
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

  .consent__content h3 {
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
    background: #cc7180;
    color: white;
    font-size: 14px;
  }

  .consent__button:hover {
    opacity: 0.9;
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