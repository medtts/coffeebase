// --- State Management ---
let cart = [];
let productsData = [];
let storiesData = [];
let shopsData = [];

// --- Initialize App & Load JSON Data ---
async function initApp() {
    try {
        const [productsRes, storiesRes, shopsRes] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/stories.json'),
            fetch('data/shops.json')
        ]);

        if (!productsRes.ok || !storiesRes.ok || !shopsRes.ok) {
            throw new Error('外部データの読み込みに失敗しました。');
        }

        productsData = await productsRes.json();
        storiesData = await storiesRes.json();
        shopsData = await shopsRes.json();

        // オンラインストアページ等の初期描画が必要な場合を考慮
        const grid = document.getElementById('products-grid');
        if (grid) {
            filterProducts('all');
        }
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// --- Cart & Modal Logic ---
function addToCart(id) {
    const product = productsData.find(p => p.id === id);
    if(!product) return;
    const existing = cart.find(item => item.id === id);
    if(existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartBadge();
    showNotification('Shopping Cart', `「${product.name}」をカートに追加しました。`);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if(!badge) return;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if(totalQty > 0) {
        badge.innerText = totalQty;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function openCartModal() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    if(!container) return;
    
    if(cart.length === 0) {
        container.innerHTML = `<p class="cart-drawer__empty">カートに商品は入っていません。</p>`;
        subtotalEl.innerText = '¥0';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-line">
                <div>
                    <h4 class="cart-line__name">${item.name}</h4>
                    <p class="cart-line__price">¥${item.price.toLocaleString()} × ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="cart-line__remove">Remove</button>
            </div>
        `).join('');
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        subtotalEl.innerText = `¥${subtotal.toLocaleString()} JPY`;
    }
    document.getElementById('cart-drawer').classList.remove('hidden');
}

function closeCartModal() {
    document.getElementById('cart-drawer').classList.add('hidden');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartBadge();
    openCartModal();
}

function checkoutCart() {
    if(cart.length === 0) {
        showNotification('カート', 'カートに商品がありません。');
        return;
    }
    showNotification('ご注文手続き', 'ご注文ありがとうございます。デモ環境のため決済はシミュレートされました。');
    cart = [];
    updateCartBadge();
    closeCartModal();
}

function showNotification(title, message) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('notification-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('notification-modal').classList.add('hidden');
}

function handleSubscribe(e) {
    e.preventDefault();
    showNotification('Newsletter', 'ニュースレターのご登録ありがとうございます。確認メールをお送りしました。');
    e.target.reset();
}

function handleContactSubmit(e) {
    e.preventDefault();
    showNotification('Contact Success', 'お問い合わせを受け付けました。担当者より数日以内にご連絡いたします。');
    e.target.reset();
}

// Online store specific filter
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('filter-btn--active');
    });
    const activeBtn = document.getElementById(`filter-${category}`);
    if(activeBtn) {
        activeBtn.classList.add('filter-btn--active');
    }

    const grid = document.getElementById('products-grid');
    if(!grid) return;
    const filtered = category === 'all' ? productsData : productsData.filter(p => p.category === category);

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div>
                <div class="product-card__media">
                    <img src="${p.image}" alt="${p.name}" class="product-card__img">
                </div>
                <div class="product-card__body">
                    <div class="product-card__tags">
                        <span>${p.roast}</span>
                        <span>${p.weight}</span>
                    </div>
                    <h3 class="product-card__name">${p.name}</h3>
                    <p class="product-card__notes">Notes: ${p.notes}</p>
                    <p class="product-card__price">¥${p.price.toLocaleString()} JPY</p>
                </div>
            </div>
            <div class="product-card__cta">
                <button onclick="addToCart(${p.id})" class="product-card__add-btn">Add to Cart</button>
            </div>
        </div>
    `).join('');
}



// 1. Lenisの初期化
const lenis = new Lenis({
  autoRaf: true, // 毎フレームの更新を自動で行う設定
});

// 2. jQueryを使ったアンカーリンクの連携
$(function () {
  $('a[href^="#"]').on('click', function (e) {
    e.preventDefault(); // デフォルトのジャンプを抑制

    const href = $(this).attr('href');
    const target = $(href === '#' || href === '' ? 'html' : href);

    if (target.length) {
      // Lenisの機能を使ってスムーススクロールさせる
      lenis.scrollTo(target.get(0), {
        offset: 0,     // ヘッダーがある場合は高さ分のマイナス調整（例: -80）
        duration: 1.2, // スクロールにかかる時間（秒）
      });
    }
  });
});

// ==========================================
// 日本地図
// ==========================================
const maps = [ "../images/map-mobile.svg" ]
const containers = document.querySelectorAll( '.map' )
const targetPrefs = [ "tokyo", "shiga", "kyoto", "osaka" ]

maps.forEach( async ( map, index ) => {
    const res = await fetch( map )
    if ( res.ok ) {
        const svg = await res.text()
        containers[ index ].innerHTML = svg
        const prefs = document.querySelectorAll( '.geolonia-svg-map .prefecture' )

        prefs.forEach( ( pref ) => {
            const isTarget = targetPrefs.some( target => pref.classList.contains( target ) )

            if ( isTarget ) {
                pref.addEventListener( 'mouseover', ( event ) => {
                    event.currentTarget.style.fill = "#000"
                } )
                pref.addEventListener( 'mouseleave', ( event ) => {
                    event.currentTarget.style.fill = ""
                } )

                pref.addEventListener( 'click', ( event ) => {
                    const matchedTarget = targetPrefs.find( target => event.currentTarget.classList.contains( target ) )
                    if ( matchedTarget ) {
                        const targetSection = document.getElementById( `area-${matchedTarget}` )
                        if ( targetSection ) {
                            const rect = targetSection.getBoundingClientRect()
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                            const targetY = rect.top + scrollTop - 300

                            window.scrollTo({
                                top: targetY,
                                behavior: 'smooth'
                            })
                        }
                    }
                } )
                pref.style.cursor = 'pointer'
            } else {
                pref.style.cursor = 'default'
                pref.style.pointerEvents = 'none'
            }
        } )
    }
} )


// ==========================================
// 左側の回転画像 ＆ 同心円ナビゲーションの連動
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const targetImg = document.getElementById('targetImg');
    const circularNav = document.getElementById('circularNav');
    const navItems = document.querySelectorAll('.nav-item');
    const dotItems = document.querySelectorAll('.dot-item');
    const sections = document.querySelectorAll('section');

    const angleStep = 9;
    const sectionAngles = [];

    navItems.forEach((item, index) => {
        const angle = index * angleStep;
        item.style.setProperty('--item-angle', `${angle}deg`);
        sectionAngles.push(-angle);
    });

    // ★ 現在アクティブなインデックスを保存する変数（初期値 -1）
    let currentActiveIndex = -1; 

    const update = () => {
        const scrollY = window.scrollY;

        // 画像の回転（全体のスクロール割合で計算。これは毎フレーム動かしてOK）
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
        
        if (targetImg) {
            targetImg.style.transform = `rotate(${-90 + progress * 90}deg)`;
        }

        // 画面中央にあるセクションの判定
        const viewportCenter = scrollY + window.innerHeight / 2;
        let newActiveIndex = -1; // 今回のスクロール位置でアクティブになるべきインデックス

        sections.forEach((section, index) => {
            const top = section.offsetTop;
            if (viewportCenter >= top && viewportCenter < top + section.offsetHeight) {
                newActiveIndex = index;
            }
        });

        // ★★★ ここが最重要ポイント ★★★
        // 「前回と同じセクション」にいる間は、無駄なクラスの付け外しを一切行わない
        if (newActiveIndex !== -1 && newActiveIndex !== currentActiveIndex) {
            
            // 新しいインデックスに更新
            currentActiveIndex = newActiveIndex;

            if (circularNav) {
                circularNav.style.setProperty('--nav-rotation', `${sectionAngles[newActiveIndex] ?? 0}deg`);
            }

            // PC用ナビのクラス更新（toggleを使うとシンプルになります）
            navItems.forEach((item, index) => {
                item.classList.toggle('is-active', index === newActiveIndex);
            });

            // スマホ用ドットのクラス更新
            dotItems.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === newActiveIndex);
            });
        }
    };

    // requestAnimationFrame でスクロール時の負荷を軽減
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                update();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
});