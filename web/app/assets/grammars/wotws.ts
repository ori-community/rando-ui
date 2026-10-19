import type { LanguageRegistration } from 'shiki'

const seedLanguage: LanguageRegistration = {
  name: 'wotws',
  scopeName: 'source.wotws',
  patterns: [
    { include: '#comment' },
    { include: '#keyword' },
    { include: '#type' },
    { include: '#command' },
    { include: '#annotation' },
    { include: '#function' },
    { include: '#uberIdentifier' },
    { include: '#number' },
    { include: '#constant' },
    { include: '#identifier' },
    { include: '#string' },
  ],
  repository: {
    comment: {
      match: '//[^\\n]*',
      name: 'comment',
    },
    keyword: {
      patterns: [
        {
          match: '\\b(?:fun|true|false)\\b',
          name: 'keyword.other',
        },
        {
          match: '\\b(?:on|change|if)\\b',
          name: 'keyword.control',
        },
      ],
    },
    type: {
      match: '\\b(?:Boolean|Integer|Float|String)\\b',
      name: 'entity.name.type',
    },
    constant: {
      patterns: [
        {
          match: '[A-Z]\\w*',
          name: 'variable.other.enummember',
        },
      ],
    },
    function: {
      match: '(\\w+)\\(',
      captures: {
        '1': {
          name: 'entity.name.function',
        },
      },
    },
    command: {
      match: '!\\s*\\w*',
      name: 'entity.name.function.preprocessor',
    },
    annotation: {
      match: '#\\s*\\w*',
      name: 'entity.name.function.preprocessor',
    },
    uberIdentifier: {
      patterns: [
        {
          match: '\\d+\\|\\d+',
          name: 'constant.numeric',
        },
        {
          match: '\\w+(?:\\.\\w+){1,2}',
          name: 'constant.numeric',
        },
      ],
    },
    number: {
      match: '-?\\d+\\.?\\d*',
      name: 'constant.numeric',
    },
    identifier: {
      match: '[_a-z]\\w*',
      name: 'variable',
    },
    string: {
      begin: '"',
      end: '"',
      name: 'string.quoted.double',
    },
  },
}

export default seedLanguage
