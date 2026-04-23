import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Check, X, Package, BookOpen } from 'lucide-react';
import { getLanguageCode } from '../../data/booksData';
import { useCart } from '../../contexts/CartContext';
import { packCartStorage } from '../../services/cart.service';
import { getBookCoverUrl } from '../../utils/imageUtils';
import InlineMarkdown from './InlineMarkdown';
import { playCartSound } from '../../utils/cartSound';

export default function CartConfirmationPopup({
    isOpen,
    onClose,
    book,
    packBooks = [],
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { cartItems, loadCartPacks } = useCart();
    const [animateCheck, setAnimateCheck] = useState(false);
    const hasPlayedRef = useRef(false);
    const [otherCartItems, setOtherCartItems] = useState([]);

    // Snapshot cart state when popup opens — frozen for the lifetime of this open session.
    // Using a ref to detect the open transition so we only re-snapshot on each new open,
    // not on every cartItems change (which would show the just-added item in the strip).
    const wasOpenRef = useRef(false);
    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            wasOpenRef.current = true;

            // Capture book/cartItems values sync, before any async gap.
            const currentBook = book;
            const currentCartItems = cartItems;

            // Read pack items directly from localStorage — this is the only source
            // immune to React state/context timing. By now addPackToCart has already
            // written to localStorage, so we filter out the just-added pack using
            // string comparison (avoids Number(undefined)=NaN silently passing the filter).
            const justAddedPackId = currentBook?.isPack ? String(currentBook.id) : null;
            const rawPackItems = packCartStorage.get();
            const currentPackCartItems = justAddedPackId !== null
                ? rawPackItems.filter(item => String(item.packId) !== justAddedPackId)
                : rawPackItems;

            const buildSnapshot = (packsData) => {
                const items = [];

                // Books already in cart (excluding the one just added)
                const justAddedBookId = !currentBook?.isPack ? Number(currentBook?.id) : null;
                currentCartItems.forEach(item => {
                    if (Number(item.bookId) !== justAddedBookId) {
                        items.push({
                            id: item.bookId,
                            type: 'book',
                            coverImage: getBookCoverUrl(item.bookId),
                        });
                    }
                });

                // Packs already in cart, excluding the one just added
                currentPackCartItems.forEach(({ packId }) => {
                    const hydratedPack = packsData.find(p => String(p.id) === String(packId));
                    const firstBook = hydratedPack?.books?.[0];
                    if (firstBook) {
                        items.push({
                            id: Number(packId),
                            type: 'pack',
                            coverImage: firstBook.coverImage || getBookCoverUrl(firstBook.id),
                        });
                    }
                });

                setOtherCartItems(items);
            };

            if (currentPackCartItems.length > 0) {
                loadCartPacks().then(packs => {
                    buildSnapshot(packs || []);
                });
            } else {
                buildSnapshot([]);
            }
        }

        if (!isOpen) {
            wasOpenRef.current = false;
            setOtherCartItems([]); // Reset on close so the strip never shows stale items on next open
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Play sound + trigger check animation when popup opens
    useEffect(() => {
        if (isOpen && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            const timer = setTimeout(() => {
                playCartSound();
                setAnimateCheck(true);
            }, 120);
            return () => clearTimeout(timer);
        }
        if (!isOpen) {
            hasPlayedRef.current = false;
            setAnimateCheck(false);
        }
    }, [isOpen]);

    // Prevent body scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Filter out the just-added item so it never appears in its own strip
    const stripItems = otherCartItems.filter(item =>
        book?.isPack
            ? !(item.type === 'pack' && String(item.id) === String(book.id))
            : !(item.type === 'book' && String(item.id) === String(book?.id))
    );

    const handleOpenDetails = () => {
        window.open(`/books/${book.id}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-fade-in-backdrop"
                onClick={onClose}
            />

            {/* Popup Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-4" onClick={onClose}>
                <div
                    className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-[28rem] xs:max-w-lg animate-fade-in-scale"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="relative px-3 xs:px-5 pt-3 xs:pt-4 pb-2.5 xs:pb-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-2 xs:gap-3">
                            {/* Animated cart icon */}
                            <div className={`relative cart-icon-container ${animateCheck ? 'cart-icon-animate' : ''}`}>
                                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-green-50 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
                                </div>
                                <div className={`absolute -top-1 -right-1 w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center ${animateCheck ? 'check-badge-pop' : ''}`}
                                    style={{ background: '#16A34A' }}
                                >
                                    <Check className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white" strokeWidth={3} />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm xs:text-fluid-h2 lg:text-fluid-lg">
                                {t('cartPopup.title')}
                            </h3>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 xs:top-3 xs:right-3 w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            aria-label={t('cartPopup.close')}
                        >
                            <X className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Book Details Section — larger cover */}
                    <div className="px-3 xs:px-5 pt-4 xs:pt-5 pb-2 xs:pb-3">
                        <div className="flex gap-3 xs:gap-5">
                            {/* Primary Book Cover — clickable */}
                            <div className="flex-shrink-0 cover-slide-in relative cursor-pointer" onClick={handleOpenDetails}>
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-28 h-[10.5rem] xs:w-36 xs:h-[13.5rem] object-cover rounded-lg xs:rounded-xl shadow-lg"
                                />
                                {/* Synopsis badge */}
                                {book.description && !book.isPack && (
                                    <div className="absolute bottom-1.5 right-1.5 xs:bottom-2 xs:right-2 w-6 h-6 xs:w-7 xs:h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md ring-1 ring-black/5 synopsis-hint">
                                        <BookOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[#00417a]" strokeWidth={2} />
                                    </div>
                                )}
                            </div>

                            {/* Book Info and Actions */}
                            <div className="flex-1 flex flex-col min-w-0 h-[10.5rem] xs:h-[13.5rem]">
                                {/* Top Section: Title, Author, Price */}
                                <div className="flex gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className="font-semibold text-gray-900 text-sm xs:text-fluid-lg mb-0.5 xs:mb-1 line-clamp-2 cursor-pointer hover:text-[#00417a] transition-colors"
                                            onClick={handleOpenDetails}
                                        >
                                            <InlineMarkdown>{book.title}</InlineMarkdown>
                                        </h4>
                                        {!book.isPack ? (
                                            <p className="text-gray-600 text-[0.7rem] xs:text-sm mb-1.5 xs:mb-2">
                                                {book.author}
                                            </p>
                                        ) : (
                                            <>
                                                <p className="text-gray-600 text-[0.7rem] xs:text-sm mb-1 xs:mb-2">
                                                    {book.author}
                                                </p>
                                                {/* Book Titles Carousel — Only for packs */}
                                                {packBooks.length > 0 && (
                                                    <div className="mt-1 xs:mt-2">
                                                        <div className="flex gap-1 xs:gap-1.5 overflow-x-auto scrollbar-hide py-1 xs:py-1.5">
                                                            {packBooks.map((packBook, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="text-[0.55rem] xs:text-fluid-vsmall md:text-fluid-small bg-blue-50 text-[#00417a] px-1.5 xs:px-3 py-0.5 xs:py-1 rounded-md whitespace-nowrap flex-shrink-0 font-medium"
                                                                >
                                                                    <InlineMarkdown>{packBook.title}</InlineMarkdown>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="font-bold text-gray-900 text-base xs:text-fluid-lg">
                                            {book.price}
                                        </p>
                                        <p className="text-gray-500 text-[0.6rem] xs:text-sm mb-0.5 xs:mb-1">
                                            {t('cartPopup.currency')}
                                        </p>
                                        {book.language && (
                                            <span className="inline-block px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-100 text-blue-700 text-[0.55rem] xs:text-xs font-semibold rounded">
                                                {getLanguageCode(book.language)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1"></div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 mt-2 xs:mt-3">
                                    <button
                                        onClick={() => {
                                            navigate('/cart');
                                            onClose();
                                        }}
                                        className="w-full min-h-[2rem] xs:min-h-[2.25rem] bg-[#16A34A] hover:bg-green-700 text-white font-medium px-2 xs:px-3 rounded-md xs:rounded-lg transition-colors flex items-center justify-center gap-1 xs:gap-2"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0" />
                                        <span className="text-[0.65rem] xs:text-xs">{t('cartPopup.viewCart')}</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full min-h-[2rem] xs:min-h-[2.25rem] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2 xs:px-3 rounded-md xs:rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <span className="text-[0.65rem] xs:text-xs">{t('cartPopup.keepShopping')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Existing cart items strip */}
                    {stripItems.length > 0 && (
                        <div className="px-3 xs:px-5 pb-4 xs:pb-5 pt-1 xs:pt-2">
                            <div className="border-t border-blue-100 pt-3 xs:pt-4 -mx-3 xs:-mx-5 px-3 xs:px-5 pb-1 bg-blue-50/50 rounded-b-xl xs:rounded-b-2xl">
                                <p className="text-[0.6rem] xs:text-xs text-[#00417a]/50 font-medium uppercase tracking-wider mb-2 xs:mb-2.5">
                                    {t('cartPopup.alsoInCart')}
                                </p>
                                <div className="flex gap-2 xs:gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                                    {stripItems.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex-shrink-0 cart-thumb-enter relative"
                                        >
                                            <img
                                                src={item.coverImage}
                                                alt=""
                                                className="w-10 h-[3.75rem] xs:w-12 xs:h-[4.5rem] object-cover rounded-md shadow-sm ring-1 ring-gray-200/60"
                                            />
                                            {/* Pack indicator badge */}
                                            {item.type === 'pack' && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 xs:w-[1.15rem] xs:h-[1.15rem] bg-[#00417a] rounded-full flex items-center justify-center shadow-sm ring-1.5 ring-white">
                                                    <Package className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white" strokeWidth={2.5} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom padding when no other items */}
                    {stripItems.length === 0 && (
                        <div className="pb-3 xs:pb-4" />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.93) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fadeInBackdrop {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
                }
                .animate-fade-in-backdrop {
                    animation: fadeInBackdrop 0.2s ease-out;
                }

                /* Cover image slides in from left — 1s to match sound */
                @keyframes coverSlideIn {
                    0% { opacity: 0; transform: translateX(-16px) scale(0.94); }
                    30% { opacity: 1; transform: translateX(3px) scale(1.02); }
                    60% { transform: translateX(-1px) scale(1); }
                    100% { transform: translateX(0) scale(1); }
                }
                .cover-slide-in {
                    animation: coverSlideIn 1s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
                }

                /* Cart icon bounce — 1s matching pop-swoosh */
                @keyframes cartIconBounce {
                    0% { transform: scale(1); }
                    12% { transform: scale(1.2); }
                    28% { transform: scale(0.93); }
                    44% { transform: scale(1.08); }
                    62% { transform: scale(0.98); }
                    80% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                .cart-icon-animate {
                    animation: cartIconBounce 1s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* Check badge pops in with overshoot — 1s */
                @keyframes checkBadgePop {
                    0% { transform: scale(0) rotate(-50deg); opacity: 0; }
                    20% { transform: scale(1.4) rotate(10deg); opacity: 1; }
                    38% { transform: scale(0.88) rotate(-4deg); }
                    55% { transform: scale(1.1) rotate(2deg); }
                    75% { transform: scale(0.97) rotate(0deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .check-badge-pop {
                    animation: checkBadgePop 1s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* Synopsis hint badge pulse */
                @keyframes synopsisHint {
                    0%, 100% { opacity: 0.7; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.08); }
                }
                .synopsis-hint {
                    animation: synopsisHint 2.5s ease-in-out 1.5s 2;
                }

                /* Thumbnail stagger entrance */
                @keyframes thumbEnter {
                    from { opacity: 0; transform: translateY(6px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .cart-thumb-enter {
                    animation: thumbEnter 0.3s ease-out both;
                }
                .cart-thumb-enter:nth-child(1) { animation-delay: 0.15s; }
                .cart-thumb-enter:nth-child(2) { animation-delay: 0.22s; }
                .cart-thumb-enter:nth-child(3) { animation-delay: 0.29s; }
                .cart-thumb-enter:nth-child(4) { animation-delay: 0.36s; }
                .cart-thumb-enter:nth-child(5) { animation-delay: 0.43s; }
                .cart-thumb-enter:nth-child(6) { animation-delay: 0.50s; }
                .cart-thumb-enter:nth-child(n+7) { animation-delay: 0.55s; }
            `}</style>
        </>
    );
}
