<script>
  import Container from '../atoms/container.svelte';
  import IconCircle from '../atoms/iconCircle.svelte';
  import { Heart, Pointer } from '@lucide/svelte';
	import { Tween } from 'svelte/motion';
	import { onMount } from 'svelte';
	import CTAButton from '../atoms/CTAButton.svelte';

  const size = new Tween(32);

async function pulse() {
  while (true) {
    await size.set(38, { duration: 240 });
    await size.set(34, { duration: 120 });
    await size.set(40, { duration: 140 });
    await size.set(32, { duration: 450 });
  }
}


  onMount(pulse);

</script>

<section class="hero">
  <IconCircle>
    <Heart size={size.current} color="#AD1F3610" fill="#AD1F3660" />
  </IconCircle>
  <Container>
    <h1>
      Organize seu casamento sem planilhas,
      grupos caóticos e dor de cabeça.
    </h1>

    <p>
      Estamos criando um app que centraliza convidados,
      presença, presentes e fotos do seu grande dia. <br /><br />
      Seu casamento começa hoje, na organização.
    </p>

    <CTAButton href="https://forms.gle/ckQrXLZ7NkwSeDeD6"/>
    <div class="mouse-indicator">
      <div class="mouse-indicator__container">
        <div class="mouse-indicator__dot"></div>
      </div>
    </div>

    <div class="hand-indicator">
      <div class="hand-indicator__container">
        <Pointer rotate={-35} color="#d799a2" width={32} height={32} />
      </div>
    </div>
  </Container>
</section>

<style lang="scss">
.hero {
  text-align: center;
  height: 100vh;
  background: #f6f1f1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 48px;
    margin-bottom: 20px;
  }

  p {
    color: #7a6a6a;
    margin-bottom: 40px;
    font-size: 18px;
  }
}

$primary: #ce5065;

.mouse-indicator {
  margin-top: 4rem;
  opacity: 0;
  animation: fade-in-up 0.6s ease forwards;
  animation-delay: 0.6s;

  @media (max-width: 600px) {
    display: none;
  }

  &__container {
    width: 1.5rem;
    height: 2.5rem;
    border: 2px solid rgba($primary, 0.4);
    border-radius: 9999px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  &__dot {
    width: 0.375rem;
    height: 0.75rem;
    background: rgba($primary, 0.6);
    border-radius: 9999px;
    margin-top: 0.5rem;
    animation: pulse-soft 2s ease-in-out infinite;
  }
}

.hand-indicator {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fade-in-up 0.6s ease forwards;
  opacity: 0;
  
  animation-delay: 0.8s;

  @media (min-width: 600px) {
    display: none;
  }
  
  &__container {
    transform: rotateZ(-30deg);
    animation: pulse-soft-rotate 2s ease-in-out infinite;
    }
  
  svg {
    animation: fade-in-up 0.6s ease forwards;
    animation-delay: 1s;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-soft-rotate {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0) rotate(-30deg);
  }
  50% {
    opacity: 1;
    transform: translateY(6px) rotate(-60deg);
  }
}

@keyframes pulse-soft {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(6px);
  }
}
</style>
