const path = require('path');
const { translate } = require('translate-american-british-english');

class NZSpellingConverter {
  constructor() {
    this.phraseMap = require('../data/phrase_map.json');
    this.exceptionsMap = require('../data/spelling_exceptions.json');
    this.customMappings = {};
    this.gbDictionary = null;
    this.usDictionary = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const { getDictionary } = await import('cspell-lib');
    const gbExt = require('@cspell/dict-en-gb-ise/cspell-ext.json');
    const usExt = require('@cspell/dict-en_us/cspell-ext.json');
    const gbDef = gbExt.dictionaryDefinitions[0];
    const usDef = usExt.dictionaryDefinitions[0];

    const gbSettings = {
      dictionaryDefinitions: [
        {
          ...gbDef,
          path: path.resolve(__dirname, '../../node_modules/@cspell/dict-en-gb-ise', gbDef.path),
        },
      ],
      dictionaries: [gbDef.name],
    };

    const usSettings = {
      dictionaryDefinitions: [
        {
          ...usDef,
          path: path.resolve(__dirname, '../../node_modules/@cspell/dict-en_us', usDef.path),
        },
      ],
      dictionaries: [usDef.name],
    };

    const [gbDictionary, usDictionary] = await Promise.all([
      getDictionary(gbSettings),
      getDictionary(usSettings),
    ]);

    this.gbDictionary = gbDictionary;
    this.usDictionary = usDictionary;
    this.initialized = true;
  }

  escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  matchCase(src, replacement) {
    if (src.toUpperCase() === src) {
      return replacement.toUpperCase();
    }
    if (src[0].toUpperCase() === src[0] && src.slice(1).toLowerCase() === src.slice(1)) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  replaceEmDash(text) {
    return text.replace(/\u2014/g, ' - ');
  }

  protectCurrencySymbols(text) {
    const token = '[[DOLLAR]]';
    return text.replace(/\$/g, token);
  }

  restoreCurrencySymbols(text) {
    const token = '\\[\\[DOLLAR\\]\\]';
    return text.replace(new RegExp(token, 'g'), '$$');
  }

  titleCase(text) {
    return text
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
      .join(' ');
  }

  matchPhraseCase(src, replacement) {
    if (src.toUpperCase() === src) {
      return replacement.toUpperCase();
    }
    if (src.toLowerCase() === src) {
      return replacement.toLowerCase();
    }
    const words = src.split(' ');
    const isTitle = words.every((word) =>
      word ? word[0].toUpperCase() === word[0] && word.slice(1).toLowerCase() === word.slice(1) : false,
    );
    if (isTitle) {
      return this.titleCase(replacement);
    }
    return replacement;
  }

  applyMappings(text, mappings) {
    const entries = Object.keys(mappings)
      .map((phrase) => ({ phrase, replacement: mappings[phrase] }))
      .sort((a, b) => b.phrase.length - a.phrase.length);

    let updated = text;
    for (const { phrase, replacement } of entries) {
      const regex = new RegExp(`\\b${this.escapeRegExp(phrase)}\\b`, 'gi');
      updated = updated.replace(regex, (match) => this.matchPhraseCase(match, replacement));
    }
    return updated;
  }

  applyPhraseReplacements(text) {
    return this.applyMappings(text, this.phraseMap);
  }

  applyExceptionReplacements(text) {
    return this.applyMappings(text, this.exceptionsMap);
  }

  applyCustomMappings(text) {
    return this.applyMappings(text, this.customMappings);
  }

  applyIseConversions(text) {
    const suffixes = [
      ['izations', 'isations'],
      ['ization', 'isation'],
      ['izers', 'isers'],
      ['izer', 'iser'],
      ['izing', 'ising'],
      ['ized', 'ised'],
      ['izes', 'ises'],
      ['ize', 'ise'],
    ];

    return text.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (word) => {
      const lower = word.toLowerCase();
      if (this.gbDictionary.has(lower, { ignoreCase: true })) {
        return word;
      }
      for (const [from, to] of suffixes) {
        if (!lower.endsWith(from)) {
          continue;
        }
        const candidate = lower.replace(new RegExp(`${from}$`), to);
        if (
          this.usDictionary.has(lower, { ignoreCase: true })
          && this.gbDictionary.has(candidate, { ignoreCase: true })
        ) {
          return this.matchCase(word, candidate);
        }
      }
      return word;
    });
  }

  async convert(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    const normalized = this.replaceEmDash(text);
    const phraseAdjusted = this.applyPhraseReplacements(normalized);
    const exceptionAdjusted = this.applyExceptionReplacements(phraseAdjusted);
    const customAdjusted = this.applyCustomMappings(exceptionAdjusted);
    const protectedCurrency = this.protectCurrencySymbols(customAdjusted);
    const translated = translate(protectedCurrency);
    const restoredCurrency = this.restoreCurrencySymbols(translated);
    const restoredExceptions = this.applyExceptionReplacements(restoredCurrency);
    const restoredCustom = this.applyCustomMappings(restoredExceptions);
    const finalPhrases = this.applyPhraseReplacements(restoredCustom);
    return this.applyIseConversions(finalPhrases);
  }

  async convertObject(value) {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.walkAsync(value, async (text) => this.convert(text));
  }

  async walkAsync(value, transform) {
    if (Array.isArray(value)) {
      const items = await Promise.all(value.map((item) => this.walkAsync(item, transform)));
      return items;
    }
    if (value && typeof value === 'object') {
      const entries = await Promise.all(
        Object.entries(value).map(async ([key, val]) => [key, await this.walkAsync(val, transform)]),
      );
      return Object.fromEntries(entries);
    }
    if (typeof value === 'string') {
      return transform(value);
    }
    return value;
  }

  addCustomMapping(from, to) {
    this.customMappings[from] = to;
  }

  removeCustomMapping(from) {
    delete this.customMappings[from];
  }

  getCustomMappings() {
    return { ...this.customMappings };
  }

  clearCustomMappings() {
    this.customMappings = {};
  }
}

module.exports = NZSpellingConverter;
