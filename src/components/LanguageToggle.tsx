import { useCallback, useEffect, useRef, useState } from 'react';
import * as OpenCC from 'opencc-js';

const toCN = OpenCC.Converter({ from: 'tw', to: 'cn' });
const SKIP_SELECTOR = 'script, style, noscript, svg, canvas, textarea, input, select, option, [data-no-convert]';
const OBSERVER_OPTIONS: MutationObserverInit = {
  childList: true,
  characterData: true,
  subtree: true,
};

function isStoredCN(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem('preferred-language') === 'cn'; } catch { return false; }
}

export default function LanguageToggle() {
  const [isCN, setIsCN] = useState(isStoredCN);
  const isCNRef = useRef(isCN);
  const isApplyingRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const origRef = useRef<WeakMap<Text, string>>(new WeakMap());

  const getTextNodes = useCallback((root: Node) => {
    const nodes: Text[] = [];
    if (root instanceof Text) {
      const parent = root.parentElement;
      if (parent && !parent.closest(SKIP_SELECTOR) && root.data.trim()) nodes.push(root);
      return nodes;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        if (!node.data.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    return nodes;
  }, []);

  const applyLanguage = useCallback((root: Node = document.body) => {
    if (!root) return;
    observerRef.current?.disconnect();
    isApplyingRef.current = true;

    try {
      const map = origRef.current;
      getTextNodes(root).forEach((node) => {
        if (isCNRef.current) {
          if (!map.has(node)) map.set(node, node.data);
          const converted = toCN(map.get(node) ?? node.data);
          if (node.data !== converted) node.data = converted;
          return;
        }

        const original = map.get(node);
        if (original !== undefined) {
          if (node.data !== original) node.data = original;
          map.delete(node);
        }
      });
    } finally {
      isApplyingRef.current = false;
      if (isCNRef.current && document.body) {
        observerRef.current?.observe(document.body, OBSERVER_OPTIONS);
      }
    }
  }, [getTextNodes]);

  useEffect(() => {
    isCNRef.current = isCN;
    try { localStorage.setItem('preferred-language', isCN ? 'cn' : 'tw'); } catch {}
    document.documentElement.lang = isCN ? 'zh-CN' : 'zh-TW';
    observerRef.current?.disconnect();

    observerRef.current = new MutationObserver((mutations) => {
      if (isApplyingRef.current || !isCNRef.current) return;
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' && mutation.target instanceof Text) {
          origRef.current.set(mutation.target, mutation.target.data);
          applyLanguage(mutation.target);
        }
        mutation.addedNodes.forEach((node) => applyLanguage(node));
      });
    });
    applyLanguage();
    if (!isCN) observerRef.current.disconnect();

    return () => observerRef.current?.disconnect();
  }, [applyLanguage, isCN]);

  return (
    <div className="flex items-center rounded-full border border-gray-200 bg-gray-100 p-1.5 shadow-inner">
      <button
        type="button"
        onClick={() => setIsCN(!isCN)}
        className="rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
      >
        {isCN ? '繁' : '簡'}
      </button>
    </div>
  );
}
