<script>
  import Container from '../../components/atoms/container.svelte';
  import IconCircle from '../../components/atoms/iconCircle.svelte';
  import { Heart } from '@lucide/svelte';
	import { Tween } from 'svelte/motion';
	import { onMount } from 'svelte';

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
      Muito Obrigado pela sua resposta! <br />
      Estamos muito felizes em ter você com a gente nessa jornada.
    </h1>

    <p>
      Esperamos que o app que estamos criando torne a organização do seu casamento mais fácil, leve e até divertida. <br /><br />
      Fique de olho no seu email, vamos enviar atualizações sobre o desenvolvimento do app e, claro, avisar quando ele estiver disponível para download.
    </p>
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

  opacity: 0;
  animation: fade-in-up 0.6s ease forwards;

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
