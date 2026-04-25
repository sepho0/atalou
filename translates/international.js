async function switchPageLang(lang) {
    try {

        // 1. MISE À JOUR DU DRAPEAU ET DU TEXTE DE LANGUE
        const langConfigs = {
            'fr': { flag: '🇫🇷', text: 'FR' },
            'en': { flag: '🇺🇸', text: 'EN' },
            'es': { flag: '🇪🇸', text: 'ES' }
        };

        const config = langConfigs[lang];
        if (config) {
            const flagEl = document.getElementById('current-lang-flag');
            const textEl = document.getElementById('current-lang-text');
            if (flagEl) flagEl.textContent = config.flag;
            if (textEl) textEl.textContent = config.text;
        }

        // 2. CHARGEMENT DES TRADUCTIONS (sans fetch — compatible file://)
        const t = window.__TRANSLATIONS__?.[lang];
        if (!t) throw new Error(`Traduction introuvable pour la langue: ${lang}`);

        // 3. MISE À JOUR DES BOUTONS DE LANGUE ACTIFS
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.l === lang);
        });

        // Helper pour injecter du texte par ID
        const setText = (id, value) => {
            if (value === undefined || value === null) return;
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        // Mise à jour automatique via data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const raw = el.getAttribute('data-i18n');
            const value = t[raw] ?? t[raw.replaceAll('.', '_')];
            if (value !== undefined && el.children.length === 0) {
                el.textContent = value;
            }
        });

        // 4. TRADUCTION DE LA NAVIGATION ET DU FOOTER
        setText('nav-services',  t.nav_services);
        setText('nav-partners',  t.nav_partners);
        setText('nav-region',    t.nav_region);
        setText('nav-cta',       t.nav_cta);
        setText('footer-rights', t.footer_rights);

        // 5. SECTION HERO (international.html)
        setText('hero-line1',  t.hero_title_line1);
        setText('hero-accent', t.hero_title_accent);
        setText('hero-line3',  t.hero_title_line3);
        setText('hero-sub',    t.hero_sub);
        setText('scroll-text', t.scroll_text);

        const btnPrimary = document.getElementById('hero-btn-primary');
        if (btnPrimary && t.hero_btn1) {
            btnPrimary.innerHTML = `${t.hero_btn1} <i class="bi bi-arrow-right ms-2"></i>`;
        }
        const btnGhost = document.getElementById('hero-btn-ghost');
        if (btnGhost && t.hero_btn2) btnGhost.textContent = t.hero_btn2;

        setText('stat-label-exp',     t.stat1);
        setText('stat-label-support', t.stat2);

        // 6. SECTION SERVICES & PARTENAIRES
        setText('svc-tag-text', t.svc_tag);
        setText('svc-title',    t.svc_title);
        setText('svc-sub',      t.svc_sub);
        for (let i = 1; i <= 7; i++) {
            setText(`svc-name-${i}`, t[`svc_name_${i}`]);
            setText(`svc-desc-${i}`, t[`svc_desc_${i}`]);
        }

        setText('part-tag-text', t.part_tag ?? t.nav_partners);
        setText('part-title',    t.part_title);
        setText('part-sub',      t.part_sub);
        setText('part-clients',  t.part_clients);

        // 7. SECTION RÉGION (Sélecteur de pays international.html)
        setText('region-tag-text',  t.nav_region);
        setText('region-title',     t.region_title);
        setText('region-sub',       t.region_sub);
        setText('region-desc-text', t.region_desc);
        setText('regionGoBtnText',  t.btn_go);
        setText('country-haiti',    t.country_haiti);
        setText('country-usa',      t.country_usa);
        setText('country-dom',      t.country_dom);
        setText('country-jm',       t.country_jm);
        setText('country-carib',    t.country_carib);

        setText('services-product-text', t.services_product_button);

        const placeholderEl = document.getElementById('selectPlaceholder');
        if (placeholderEl && t.select_placeholder) {
            placeholderEl.textContent = t.select_placeholder;
        }

        // 8. CONTENU SPÉCIFIQUE INDEX.HTML
        setText('hero.build',            t.hero_build);
        setText('hero.manage',           t.hero_manage);
        setText('hero.support',          t.hero_support);
        setText('hero_signage_text',     t.hero_signage_text);
        setText('hero.signage.subtitle', t.hero_signage_subtitle);
        setText('hero.signage.button',   t.hero_signage_button);
        setText('hero_atapos_text',      t.hero_atapos_text);
        setText('about.title',           t.about_title);
        setText('hero_atapos_title',     t.hero_atapos_title);
        setText('hero.atapos.button',    t.hero_atapos_button);

        const ataposBtn = document.getElementById('services.product.button');
        if (ataposBtn && t.services_product_button) {
            ataposBtn.innerHTML = `${t.services_product_button} <i class="fas fa-eye ms-2"></i>`;
        }

        // 9. SECTION DÉMO
        setText('demo-title',           t.demo_title);
        setText('demo-subtitle',        t.demo_subtitle);
        setText('label-fname',          t.label_fname);
        setText('label-lname',          t.label_lname);
        setText('label-email',          t.label_email);
        setText('label-phone',          t.label_phone);
        setText('label-country',        t.label_country);
        setText('label-message',        t.label_message);
        setText('btn-submit-demo',      t.btn_submit_demo);
        setText('country-placeholder',  t.country_placeholder);

        // 10. GESTION DES TÉLÉPHONES SELON LE PAYS
        const phoneMap = {
            'ht':    { main: '+509 2813-1415', sec: '+509 3333-1415' },
            'us':    { main: '+1 (954) 475-4685' },
            'do':    { main: '+1 (954) 475-4685' },
            'jm':    { main: '+1 (954) 475-4685' },
            'carib': { main: '+1 (954) 475-4685' }
        };

        const savedCountry = JSON.parse(localStorage.getItem('atalou_country') || '{}');
        const phones = phoneMap[savedCountry?.country] || phoneMap['ht'];
        setText('phone-main', phones.main);

        const secEl = document.getElementById('phone-secondary');
        if (secEl) {
            if (phones.sec) {
                secEl.textContent = phones.sec;
                secEl.closest('.secondary-phone-wrap').style.display = '';
            } else {
                secEl.closest('.secondary-phone-wrap').style.display = 'none';
            }
        }

        // 11. SAUVEGARDE ET SEO
        localStorage.setItem('atalou_pref_lang', lang);
        document.documentElement.lang = lang;

    } catch (error) {
        console.error('Erreur de traduction:', error);
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('atalou_pref_lang') || 'fr';
    switchPageLang(savedLang);
});

window.switchPageLang = switchPageLang;

// Carte Google Maps selon le pays
function updateMap() {
    const mapEl = document.getElementById('google-map');
    if (!mapEl) return;

    const savedCountry = JSON.parse(localStorage.getItem('atalou_country') || '{}');
    const country = savedCountry?.country || 'ht';

    const haitiUrl  = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.771463012156!2d-72.28829712491323!3d18.539226868604302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb9e7bc1aff5c01%3A0x6b3c5e56232fa67c!2sAtalou%20Microsystem%20s.a.!5e0!3m2!1sen!2sht!4v1756842690838!5m2!1sen!2sht';
    const globalUrl = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7261055.0!2d-68.5!3d17.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f5.0!5e0!3m2!1sen!2sht!4v1700000000000!5m2!1sen!2sht';

    mapEl.src = (country === 'ht') ? haitiUrl : globalUrl;
}
window.updateMap = updateMap;