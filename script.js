/* ========================================================================
   SUNNY DREAMS — Portfolio JS
   ======================================================================== */

// --- Preloader ---
(function () {
  // Always start at the top on page load/refresh
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const pageContent = document.getElementById('pageContent');
  const navLogo = document.querySelector('.nav__logo');
  if (pageContent) pageContent.classList.add('blurred');
  if (navLogo) navLogo.style.opacity = '0';

  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const preloaderTitle = document.getElementById('preloaderTitle');
    const content = document.getElementById('pageContent');

    const navLogoEl = document.querySelector('.nav__logo');

    // Phase 1: Title fades in (CSS: 0.8s + 0.3s delay)
    // Phase 2: After holding briefly, title fades out
    setTimeout(() => {
      if (preloaderTitle) preloaderTitle.classList.add('fade-out');
      // Phase 3: Reveal content as title fades
      setTimeout(() => {
        if (content) content.classList.remove('blurred');
        // Fade in nav logo smoothly
        if (navLogoEl) {
          navLogoEl.style.transition = 'opacity 0.8s ease';
          navLogoEl.style.opacity = '1';
        }
      }, 400);
      // Phase 4: Hide preloader background
      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
      }, 700);
    }, 1200);
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // --- Navbar scroll effect ---
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Number Counter Animation ---
  const statNumbers = document.querySelectorAll('.stat__number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // --- Helper: format seconds to MM:SS ---
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // --- Build playback bar DOM for a detail panel ---
  function createPlaybackBar(detail) {
    const bar = document.createElement('div');
    bar.className = 'project__playback';

    bar.innerHTML =
      '<span class="project__playback-time project__playback-time--current">0:00</span>' +
      '<div class="project__playback-track">' +
      '<div class="project__playback-rail"></div>' +
      '<div class="project__playback-fill"></div>' +
      '<div class="project__playback-thumb"></div>' +
      '</div>' +
      '<span class="project__playback-time project__playback-time--end">0:00</span>';

    detail.appendChild(bar);
    return bar;
  }

  // --- Detect touch device ---
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // --- Mobile: play video in top 10%-43% zone of screen ---
  if (isTouchDevice) {
    // rootMargin: -10% top, -57% bottom → active zone is 10% to 43% from top
    const mobileObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const project = entry.target;
        const video = project.querySelector('.project__video');
        if (!video) return;

        if (entry.isIntersecting) {
          project.classList.add('mobile-active');
          video.muted = true;
          video.play().catch(() => { });
        } else {
          project.classList.remove('mobile-active');
          if (!project.classList.contains('detail-open')) {
            video.pause();
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-10% 0px -57% 0px'
    });

    document.querySelectorAll('.project').forEach(p => mobileObserver.observe(p));
  }

  // --- Project Detail Panel & Video Hybrid Audio Logic ---
  document.querySelectorAll('.project').forEach(project => {
    const video = project.querySelector('.project__video');
    const detail = project.querySelector('.project__detail');
    let playbackBar = null;
    let animFrameId = null;

    // Create playback bar
    if (detail) {
      playbackBar = createPlaybackBar(detail);
    }

    const currentTimeEl = playbackBar ? playbackBar.querySelector('.project__playback-time--current') : null;
    const endTimeEl = playbackBar ? playbackBar.querySelector('.project__playback-time--end') : null;
    const trackEl = playbackBar ? playbackBar.querySelector('.project__playback-track') : null;
    const fillEl = playbackBar ? playbackBar.querySelector('.project__playback-fill') : null;
    const thumbEl = playbackBar ? playbackBar.querySelector('.project__playback-thumb') : null;

    // Update progress bar position
    function updateProgress() {
      if (!video || !fillEl || !thumbEl || !currentTimeEl) return;
      const duration = video.duration || 0;
      const current = video.currentTime || 0;
      const pct = duration > 0 ? (current / duration) * 100 : 0;

      fillEl.style.width = pct + '%';
      thumbEl.style.left = pct + '%';
      currentTimeEl.textContent = formatTime(current);
    }

    // Animation loop for smooth updates
    function startProgressLoop() {
      updateProgress();
      animFrameId = requestAnimationFrame(startProgressLoop);
    }

    function stopProgressLoop() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    // Set duration text when metadata loads
    if (video && endTimeEl) {
      video.addEventListener('loadedmetadata', () => {
        endTimeEl.textContent = formatTime(video.duration);
      });
      // If metadata already loaded
      if (video.readyState >= 1) {
        endTimeEl.textContent = formatTime(video.duration);
      }
    }

    // --- Seek logic (click & drag + touch) ---
    if (trackEl && video) {
      let isSeeking = false;

      function seekToPosition(e) {
        const rect = trackEl.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let pct = (clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        video.currentTime = pct * (video.duration || 0);
        updateProgress();
      }

      trackEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isSeeking = true;
        seekToPosition(e);
      });

      document.addEventListener('mousemove', (e) => {
        if (isSeeking) {
          seekToPosition(e);
        }
      });

      document.addEventListener('mouseup', () => {
        isSeeking = false;
      });

      // Touch seek support
      trackEl.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        isSeeking = true;
        seekToPosition(e);
      }, { passive: false });

      document.addEventListener('touchmove', (e) => {
        if (isSeeking) {
          seekToPosition(e);
        }
      }, { passive: true });

      document.addEventListener('touchend', () => {
        isSeeking = false;
      });

      // Prevent click on track from toggling the project detail
      trackEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // --- Auto-show/hide detail based on mouse position ---
    const media = project.querySelector('.project__media');

    project.addEventListener('mousemove', (e) => {
      if (!project.classList.contains('detail-open')) return;
      const rect = media.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height;

      // Bottom 40% of video = show detail
      if (relativeY > 0.6) {
        if (!detail.classList.contains('active')) {
          detail.classList.add('active');
        }
      } else {
        if (detail.classList.contains('active')) {
          detail.classList.remove('active');
        }
      }
    });

    // Hover: Play muted (only when not detail-open) — desktop only
    if (!isTouchDevice) {
      project.addEventListener('mouseenter', () => {
        if (video) {
          if (!project.classList.contains('detail-open')) {
            video.muted = true;
          }
          video.play().catch(err => console.log("Auto-play blocked or failed", err));
        }
      });

      project.addEventListener('mouseleave', () => {
        if (video) {
          if (!project.classList.contains('detail-open')) {
            video.pause();
          }
        }
        // Hide detail when mouse leaves entirely
        if (project.classList.contains('detail-open') && detail.classList.contains('active')) {
          detail.classList.remove('active');
        }
      });
    }

    // Click: Restart, Unmute, and activate project
    project.addEventListener('click', (e) => {
      // Ignore clicks on the playback bar area or detail text
      if (playbackBar && playbackBar.contains(e.target)) return;
      if (detail.contains(e.target)) return;

      const isOpen = project.classList.contains('detail-open');

      // 1. Close and mute any other open details
      document.querySelectorAll('.project').forEach(otherProject => {
        if (otherProject !== project) {
          const otherVideo = otherProject.querySelector('.video, .project__video');
          const otherDetail = otherProject.querySelector('.project__detail');

          otherProject.classList.remove('detail-open');
          if (otherDetail) otherDetail.classList.remove('active');
          if (otherVideo) {
            otherVideo.muted = true;
            otherVideo.pause();
          }
        }
      });

      // 2. Toggle this project
      if (!isOpen) {
        detail.classList.add('active');
        project.classList.add('detail-open');
        if (video) {
          video.currentTime = 0;
          video.muted = false;
          video.play();
          startProgressLoop();
        }
      } else {
        detail.classList.remove('active');
        project.classList.remove('detail-open');
        stopProgressLoop();
        if (video) {
          video.muted = true;
        }
      }
    });
  });

});
