document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURAÇÃO DO WHATSAPP (Altere para o número da Padrão Estética Automotiva)
  const WHATSAPP_NUMBER = "5511930141007";

  // ==========================================
  // 1. CARROSSEL DE BANNERS
  // ==========================================
  const track = document.getElementById("bannerTrack");
  const slides = Array.from(document.querySelectorAll(".banner-slide"));
  const dotsContainer = document.getElementById("bannerDots");
  let currentSlide = 0;
  let slideInterval;

  if (slides.length > 0) {
    const firstSlideClone = slides[0].cloneNode(true);
    firstSlideClone.setAttribute("aria-hidden", "true");
    track.appendChild(firstSlideClone);

    slides.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = `banner-dot ${idx === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Ir para banner ${idx + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(idx);
        resetSlideTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".banner-dot");

    function updateActiveDot(index) {
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function goToSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      updateActiveDot(currentSlide);
    }

    function advanceSlide() {
      if (currentSlide === slides.length - 1) {
        currentSlide = slides.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateActiveDot(0);
        return;
      }

      goToSlide(currentSlide + 1);
    }

    function resetSlideTimer() {
      clearInterval(slideInterval);
      slideInterval = setInterval(advanceSlide, 4500);
    }

    track.addEventListener("transitionend", (event) => {
      if (event.target !== track || currentSlide !== slides.length) return;

      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      currentSlide = 0;
      void track.offsetWidth;
      track.style.transition = "";
    });

    resetSlideTimer();
  }

  // ==========================================
  // 2. SISTEMA DE ABAS DINÂMICAS
  // ==========================================
  const tabsContainer = document.getElementById("categoryTabs");
  const panels = document.querySelectorAll("section[role='tabpanel']");

  panels.forEach((panel, index) => {
    const title = panel.querySelector("h2").textContent;
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.id = `tab${index}`;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-controls", panel.id);
    btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    btn.textContent = title;

    btn.addEventListener("click", () => {
      // Desativa todas as abas e esconde todos os painéis
      document.querySelectorAll(".tab-btn").forEach(b => b.setAttribute("aria-selected", "false"));
      panels.forEach(p => p.hidden = true);

      // Ativa a aba clicada e exibe o painel correspondente
      btn.setAttribute("aria-selected", "true");
      panel.hidden = false;
    });

    tabsContainer.appendChild(btn);
  });

  // ==========================================
  // 3. CARRINHO DE ORÇAMENTO E WHATSAPP
  // ==========================================
  let cart = [];

  const cartBar = document.getElementById("cartBar");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartModal = document.getElementById("cartModal");
  const cartItemsList = document.getElementById("cartItemsList");
  const modalTotalValue = document.getElementById("modalTotalValue");
  const carModelInput = document.getElementById("carModelInput");

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if (cart.length === 0) {
      cartBar.hidden = true;
      cartModal.hidden = true;
    } else {
      cartBar.hidden = false;
      cartCount.textContent = `${cart.length} ${cart.length === 1 ? "serviço selecionado" : "serviços selecionados"}`;
      cartTotal.textContent = `Total est.: ${formatBRL(total)}`;
      modalTotalValue.textContent = formatBRL(total);
    }

    // Atualiza estado visual dos cards de serviço
    document.querySelectorAll(".service").forEach(card => {
      const category = card.closest("section").dataset.category;
      const name = card.dataset.name;
      const id = `${category} - ${name}`;
      const btn = card.querySelector(".btn-add");
      const inCart = cart.some(item => item.id === id);

      card.classList.toggle("selected", inCart);
      btn.textContent = inCart ? "✓ Selecionado" : "+ Adicionar";
    });

    // Renderiza lista dentro do modal
    cartItemsList.innerHTML = "";
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-details">
          <small>${item.category}</small>
          <span>${item.name}</span>
        </div>
        <div class="cart-item-right">
          <strong>${formatBRL(item.price)}</strong>
          <button type="button" class="btn-remove-item" data-index="${index}" title="Remover">✕</button>
        </div>
      `;
      cartItemsList.appendChild(row);
    });

    // Eventos dos botões de remover dentro do modal
    document.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.dataset.index);
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  // Clique em "+ Adicionar" / "✓ Selecionado" nos serviços
  document.querySelectorAll(".service").forEach(card => {
    card.querySelector(".btn-add").addEventListener("click", () => {
      const category = card.closest("section").dataset.category;
      const name = card.dataset.name;
      const price = Number(card.dataset.price);
      const id = `${category} - ${name}`;

      const existingIndex = cart.findIndex(item => item.id === id);
      if (existingIndex > -1) {
        cart.splice(existingIndex, 1); // Remove se clicar novamente
      } else {
        cart.push({ id, category, name, price });
      }
      updateCartUI();
    });
  });

  // Abrir e fechar modal do carrinho
  document.getElementById("openCartBtn").addEventListener("click", () => {
    cartModal.hidden = false;
  });

  document.getElementById("closeCartBtn").addEventListener("click", () => {
    cartModal.hidden = true;
  });

  document.getElementById("closeCartBackdrop").addEventListener("click", () => {
    cartModal.hidden = true;
  });

  document.getElementById("clearCartBtn").addEventListener("click", () => {
    cart = [];
    updateCartUI();
  });

  // Enviar orçamento formatado para o WhatsApp
  document.getElementById("sendWhatsappBtn").addEventListener("click", () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const carModel = carModelInput.value.trim();

    let message = `Olá! Gostaria de agendar um horário na *Padrão Estética Automotiva*.\n\n`;
    if (carModel) {
      message += `*Veículo:* ${carModel}\n\n`;
    }
    message += `*Serviços selecionados:*\n`;
    cart.forEach(item => {
      message += `• [${item.category}] ${item.name} — ${formatBRL(item.price)}\n`;
    });
    message += `\n*Valor estimado (a partir de):* ${formatBRL(total)}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  });
});