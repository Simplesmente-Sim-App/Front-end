<script>
  import Container from '../atoms/container.svelte';
	import CTAButton from '../atoms/CTAButton.svelte';
	import { Clock } from '@lucide/svelte';
</script>

<section class="cta">
  <Container>
    <div class="header">
      <div class="timer">
        <Clock color="#d49ca5" /><p>Leva menos de 5 minutos</p>
      </div>
      <h2>Ajude a gente a criar o app ideal para você</h2>
      <p>
        Leva menos de 5 minutos. 
        E nos ajuda a te economizar horas de pesquisa e planejamento.
      </p>
    </div>
    <CTAButton text="Quero responder a pesquisa" href="https://forms.gle/ckQrXLZ7NkwSeDeD6" />
  </Container>
</section>

<style lang="scss">
  .cta {
    padding: 100px 0;
    text-align: center;
    background-color: rgba(243, 238, 232, 0.4)
  }

  .header {
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
      margin-bottom: 10px;
      font-size: 36px;
    }
    .timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 9999px;
      margin-bottom: 20px;
      color: #7a6a6a;
      background: rgba(173, 31, 54, 0.1);
      padding: 8px 16px;

      p {
        color: #d49ca5;
      }
    }
  }
</style>
