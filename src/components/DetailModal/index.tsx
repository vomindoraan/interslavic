import * as React from 'react';
import { connect } from 'react-redux';
import './index.scss';
import { hideDetailAction, setAlphabetTypeAction } from 'actions';
import { declensionNoun } from 'utils/legacy/declensionNoun';
import { declensionAdjective } from 'utils/legacy/declensionAdjective';
import { conjugationVerb } from 'utils/legacy/conjugationVerb';
import { LineSelector } from 'components/LineSelector';
import Table from 'components/Table';
import {
    getGender,
    getPartOfSpeech,
    getVerbType,
    isAnimated,
    isPlural,
} from 'utils/wordDetails';
import { getCyrillic, getLatin } from 'utils/translator';

interface IDetailModalProps {
    close: () => void;
    item: any;
    alphabetType: string;
    flavorisationType: string;
    setAlphabetType: (type: string) => void;
    rawItem: string[];
}

const alphabetType = [
    {
        name: 'Latin',
        value: 'latin',
    },
    {
        name: 'Cyrillic',
        value: 'cyrillic',
    },
];

class DetailModal extends React.Component<IDetailModalProps> {
    constructor(props) {
        super(props);
    }
    public render() {
        if (!this.props.item) {
            return '';
        }
        const pos = getPartOfSpeech(this.props.item.details);

        return (
            <div className={'modal show'} role={'dialog'} onClick={() => this.props.close()}>
                <div className={'modal-dialog'} role={'document'} onClick={(e) => e.stopPropagation()}>
                    <div className={'modal-content'}>
                        <div className={'modal-header'}>
                            <h5 className={'modal-title'}>{this.renderTitle(pos)}</h5>
                            <button
                                type={'button'}
                                className={'close'}
                                data-dismiss={'modal'}
                                aria-label={'Close'}
                                onClick={() => this.props.close()}
                            >
                                <span aria-hidden={'true'}>&times;</span>
                            </button>
                        </div>
                        <div className={'modal-body'}>
                            {this.renderBody(pos)}
                        </div>
                        <div className={'modal-footer'}>
                            <LineSelector
                                options={alphabetType}
                                value={this.props.alphabetType}
                                onSelect={(type) => this.props.setAlphabetType(type)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    private renderTitle(pos: string) {
        const word = this.props.rawItem[0];
        const { details } = this.props.item;
        const arr = [pos];
        const animated = isAnimated(details);
        const gender = getGender(details);
        const plural = isPlural(details);
        switch (pos) {
            case 'noun':
                arr.push(gender);
                if (animated) {
                    arr.push('animated');
                }

                if (plural) {
                    arr.push('plural');
                }
                break;
            case 'verb':
                const verbType = getVerbType(details);
                if (verbType) {
                    arr.push(getVerbType(details));
                }
                break;
        }
        return `${word} (${arr.join(', ')})`;
    }
    private renderBody(pos) {
        switch (pos) {
            case 'noun':
                return this.renderNounDetails();
            case 'adjective':
                return this.renderAdjectiveDetails();
            case 'verb':
                return this.renderVerbDetails();
            default:
                return '';
        }
    }
    private formatStr(str: string): string {
        if (!str) {
            return '';
        }
        switch (this.props.alphabetType) {
            case 'latin':
                return getLatin(str, this.props.flavorisationType);
            case 'cyrillic':
                return getCyrillic(str, this.props.flavorisationType);
        }
    }
    private renderVerbDetails() {
        const word = this.props.rawItem[0];
        const data = conjugationVerb(word, '');
        const tableDataFirst = [
            [
                '&nbsp@bl;bt;w=2',
                'present@;b',
                'imperfect@;b',
                'future@;b',
            ],
        ];
        const tableDataSecond = [
            [
                '&nbsp@bl;bt;w=2',
                'perfect@;b',
                'pluperfect@;b',
                'conditional@;b',
            ],
        ];
        const tableDataAdd = [
            [
                'infinitive@b',
                this.formatStr(data.infinitive),
            ],
            [
                'imperative@b',
                this.formatStr(data.imperative),
            ],
            [
                'present active participle@b',
                this.formatStr(data.prap),
            ],
            [
                'present passive participle@b',
                this.formatStr(data.prpp),
            ],
            [
                'past active participle@b',
                this.formatStr(data.pfap),
            ],
            [
                'past passive participle@b',
                this.formatStr(data.pfpp),
            ],
            [
                'verbal@b',
                this.formatStr(data.gerund),
            ],
        ];
        const pronouns = [
            'ja',
            'ty',
            'on/ona/ono',
            'my',
            'vy',
            'oni/one',
        ];
        const pronounsFull = [
            'ja',
            'ty',
            'on',
            'ona',
            'ono',
            'my',
            'vy',
            'oni/one',
        ];
        const forms = [
            '1sg',
            '2sg',
            '3sg',
            '1pl',
            '2pl',
            '3pl',
        ];
        const formsFull = [
            '1sg',
            '2sg',
            '3sg',
            null,
            null,
            '1pl',
            '2pl',
            '3pl',
        ];
        pronouns.forEach((pronoun, i) => {
            tableDataFirst.push([
                `${forms[i]}@b`,
                `${this.formatStr(pronoun)}@`,
                `${this.formatStr(data.present[i])}@`,
                `${this.formatStr(data.imperfect[i])}@`,
                `${this.formatStr(data.future[i])}@`,
            ]);
        });
        pronounsFull.forEach((pronoun, i) => {
            const item = [
                `${this.formatStr(pronoun)}@`,
                `${this.formatStr(data.perfect[i])}@`,
                `${this.formatStr(data.pluperfect[i])}@`,
                `${this.formatStr(data.conditional[i])}@`,
            ];
            if (formsFull[i]) {
                let str = `${formsFull[i]}@b`;
                if (formsFull[i] === '3sg') {
                    str += ';h=3';
                }
                item.unshift(str);
            }
            tableDataSecond.push(item);
        });
        return (
            <div>
                <Table data={tableDataFirst}/>
                <Table data={tableDataSecond}/>
                <Table data={tableDataAdd}/>
            </div>
        );
    }
    private renderAdjectiveDetails() {
        const word = this.props.rawItem[0];
        const { singular, plural, comparison } = declensionAdjective(word);

        const tableDataSingular = [
            [
                '&nbsp@bb;bl;bt',
                'singular@w=3;b',
            ],
            [
                '&nbsp@bl;bt',
                'masculine@b',
                'neuter@b',
                'feminine@b',
            ],
            [
                'Nom@b',
                `${this.formatStr(singular.nom[0])}@`,
                `${this.formatStr(singular.nom[1])}@h=2`,
                `${this.formatStr(singular.nom[2])}@`,
            ],
            [
                'Acc@b',
                `${this.formatStr(singular.acc[0])}@`,
                `${this.formatStr(singular.acc[1])}@`,
            ],
            [
                'Gen@b',
                `${this.formatStr(singular.gen[0])}@w=2`,
                `${this.formatStr(singular.gen[1])}@`,
            ],
            [
                'Dat@b',
                `${this.formatStr(singular.dat[0])}@w=2`,
                `${this.formatStr(singular.dat[1])}@`,
            ],
            [
                'Ins@b',
                `${this.formatStr(singular.ins[0])}@w=2`,
                `${this.formatStr(singular.ins[1])}@`,
            ],
            [
                'Loc@b',
                `${this.formatStr(singular.loc[0])}@w=2`,
                `${this.formatStr(singular.loc[1])}@`,
            ],
        ];

        const tableDataPlural = [
            [
                '&nbsp@bb;bl;bt',
                'plural@w=2;b',
            ],
            [
                '&nbsp@bl;bt',
                'masculine@b',
                'feminine/neuter@b',
            ],
            [
                'Nom@b',
                `${this.formatStr(plural.nom[0])}@`,
                `${this.formatStr(plural.nom[1])}@h=2`,
            ],
            [
                'Acc@b',
                `${this.formatStr(plural.acc[0])}@`,
            ],
            [
                'Gen@b',
                `${this.formatStr(plural.gen[0])}@w=2`,
            ],
            [
                'Dat@b',
                `${this.formatStr(plural.dat[0])}@w=2`,
            ],
            [
                'Ins@b',
                `${this.formatStr(plural.ins[0])}@w=2`,
            ],
            [
                'Loc@b',
                `${this.formatStr(plural.loc[0])}@w=2`,
            ],
        ];

        const tableDataComparison = [
            [
                'Degrees of comparison@w=3;b',
            ],
            [
                'Positive@b;h=2',
                'adjective@b',
                `${this.formatStr(comparison.positive[0])}@`,
            ],
            [
                'adverb@b',
                `${this.formatStr(comparison.positive[1])}@`,
            ],
            [
                'Comparative@b;h=2',
                'adjective@b',
                `${this.formatStr(comparison.comparative[0])}@`,
            ],
            [
                'adverb@b',
                `${this.formatStr(comparison.comparative[1])}@`,
            ],
            [
                'Superlative@b;h=2',
                'adjective@b',
                `${this.formatStr(comparison.superlative[0])}@`,
            ],
            [
                'adverb@b',
                `${this.formatStr(comparison.superlative[1])}@`,
            ],
        ];
        return (
            <div>
                <Table data={tableDataSingular}/>
                <Table data={tableDataPlural}/>
                <Table data={tableDataComparison}/>
            </div>
        );
    }
    private renderNounDetails() {
        const word = this.props.rawItem[0];
        const gender = getGender(word);
        const animated = isAnimated(word);
        const cases = declensionNoun(word, gender, animated);

        const tableDataCases = [
            [
                '&nbsp@bl;bt',
                'Singular@b',
                'Plural@b',
            ],
        ];

        Object.keys(cases).forEach((item) => {
            const leterCaseName = `${item[0].toUpperCase()}${item.slice(1)}`;
            tableDataCases.push([
                `${leterCaseName}@b`,
                `${this.formatStr(cases[item][0])}@`,
                `${this.formatStr(cases[item][1])}@`,
            ]);
        });

        tableDataCases[tableDataCases.length - 1][2] = '&nbsp@bb;br';

        return (
           <div>
               <Table data={tableDataCases}/>
           </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: () => dispatch(hideDetailAction()),
        setAlphabetType: (type) => dispatch(setAlphabetTypeAction(type)),
    };
}

function mapStateToProps({detailModal, results, rawResults, alphabetType, flavorisationType}) {
    return {
        item: results[detailModal],
        rawItem: rawResults[detailModal],
        alphabetType,
        flavorisationType,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailModal);