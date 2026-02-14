<script>
  import Container from '../atoms/container.svelte';
  import Button from '../atoms/button.svelte';
</script>

<section class="cta">
  <Container>
    <h2>Ajude a gente a criar o app ideal para você</h2>
    <p>
      Leva menos de 5 minutos. 
      E nos ajuda a te economizar horas de pesquisa e planejamento.
    </p>
    <Button text="Quero responder a pesquisa" />
  </Container>
</section>

<style lang="scss">
  .cta {
    padding: 100px 0;
    text-align: center;
  }
</style>
