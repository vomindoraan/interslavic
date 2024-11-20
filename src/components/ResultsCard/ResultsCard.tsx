import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import { t } from 'translations';

import { setNotificationAction, showModalDialog } from 'actions';
import { MODAL_DIALOG_TYPES } from 'reducers';

import { Dictionary, ITranslateResult } from 'services/dictionary';

import { useAlphabets } from 'hooks/useAlphabets';
import { useCaseQuestions } from 'hooks/useCaseQuestions';
import { useLang } from 'hooks/useLang';
import { useShortCardView } from 'hooks/useShortCardView';
import { estimateIntelligibility, hasIntelligibilityIssues } from "utils/intelligibilityIssues";
import { toQueryString } from 'utils/toQueryString';
import { getPartOfSpeech } from 'utils/wordDetails';
import { wordHasForms } from 'utils/wordHasForms';

import { Clipboard } from 'components/Clipboard';

import { removeBrackets } from "../../utils/removeBrackets";

import './ResultsCard.scss';

import ErrorIcon from './images/error-icon.svg';
import FormsIcon from './images/forms-icon.svg';
import ShareIcon from './images/share-icon.svg';
import TranslationsIcon from './images/translations-icon.svg';

interface IResultsCardProps {
    item: ITranslateResult;
    index: number;
}

function renderOriginal(item, alphabets, caseQuestions) {
    let latin = item.original;
    if (item.add) {
        latin += ` ${item.add}`;
    }

    let cyrillic = item.originalCyr;
    if (item.addCyr) {
        cyrillic += ` ${item.addCyr}`;
    }

    let gla = item.originalGla;
    if (item.addGla) {
        gla += ` ${item.addGla}`;
    }

    const result = [];

    if (alphabets.latin) {
        result.push({
            str: latin,
            caseInfo: caseQuestions && item.caseInfo,
            lang: 'isv-Latin',
        });
    }

    if (alphabets.cyrillic) {
        result.push({
            str: cyrillic,
            caseInfo: item.caseInfoCyr,
            lang: 'isv-Cyrl',
        });
    }

    if (alphabets.glagolitic) {
        result.push({
            str: gla,
            caseInfo: item.caseInfoGla,
            lang: 'isv-Glag',
        });
    }

    return (
        <>
            {result.map(({ str, caseInfo }, i) => {
                return (
                    <span className="word" key={i}>
                        <Clipboard str={str} />
                        {caseInfo && <> <span className="caseInfo">({caseInfo})</span></>}
                    </span>
                );
            })} 
            {!caseQuestions && item.caseInfo &&
                 <> <span className="caseInfo">(+{t(`case${item.caseInfo.slice(1)}`)})</span></>
            }
            {item.ipa && <> <span className="ipa">[{item.ipa}]</span></>}
        </>
    );
}

export const ResultsCard =
    ({ item, index }: IResultsCardProps) => {
        const alphabets = useAlphabets();
        const caseQuestions = useCaseQuestions();
        const wordId = Dictionary.getField(item.raw, 'id').toString();
        const pos = getPartOfSpeech(item.details);
        const dispatch = useDispatch();
        const intelligibility = Dictionary.getField(item.raw, 'intelligibility');
        const intelligibilityVector = estimateIntelligibility(intelligibility);
        const lang = useLang();

        const showTranslations = () => {
            dispatch(showModalDialog({
                type: MODAL_DIALOG_TYPES.MODAL_DIALOG_TRANSLATION,
                data: { index },
            }));
        };

        const showWordErrorModal = () => {
            dispatch(showModalDialog({
                type: MODAL_DIALOG_TYPES.MODAL_DIALOG_WORD_ERROR,
                data: {
                    wordId,
                    isvWord: item.original,
                    translatedWord: item.translate,
                },
            }));
        };

        const showDetail = () => {
            dispatch(showModalDialog({
                type: MODAL_DIALOG_TYPES.MODAL_DIALOG_WORD_FORMS,
                data: {
                    word: removeBrackets(Dictionary.getField(item.raw, 'isv'), '[', ']'),
                    add: Dictionary.getField(item.raw, 'addition'),
                    details: Dictionary.getField(item.raw, 'partOfSpeech'),
                },
            }));
        };

        const shareWord = () => {
            const { origin, pathname } = window.location;
            const query = toQueryString({
                text: `id${wordId}`,
                lang: `${lang.from}-${lang.to}`,
            });

            const url = `${origin}${pathname}?${query}`;

            if (navigator.share) {
                navigator.share({
                    url,
                });
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    const notificationText = t('wordLinkCopied', {
                        str: url,
                    });
                    dispatch(setNotificationAction({ text: notificationText }));
                });
            }
        }

        const short = useShortCardView();

        return (
            <div
                className={classNames('results-card', { short })}
                tabIndex={0}
            >
                <div className="results-card__translate">
                    {item.to !== 'isv' ? (
                        <Clipboard str={item.translate} />
                    ) : renderOriginal(item, alphabets, caseQuestions)}
                    {'\u00A0'}
                    { hasIntelligibilityIssues(intelligibilityVector)
                        ? <button
                            key="intelligibilityIssues"
                            onClick={showTranslations}
                            className={classNames({ 'results-card__status': true })}
                            title={t('intelligibilityIssues')}>⚠️</button>
                        : undefined
                    }
                    {item.to === 'isv' && short && (
                        <>
                            &nbsp;
                            <span className="results-card__details">{item.details}</span>
                        </>
                    )}
                </div>
                {!short && (
                    <span className="results-card__details">{item.details}</span>
                )}
                <div className="results-card__bottom">
                    <div className="results-card__original">
                        {item.to === 'isv' ? (
                            <Clipboard str={item.translate} />
                        ) : renderOriginal(item, alphabets, caseQuestions)}
                        {item.to !== 'isv' && short && (
                            <span className="results-card__details">{item.details}</span>
                        )}
                    </div>
                    <div className="results-card__actions">
                        <button
                            className="results-card__action-button"
                            type="button"
                            aria-label={t('shareWord')}
                            onClick={shareWord}
                        >
                            {short ? <ShareIcon /> : t('shareWord')}
                        </button>
                        <button
                            className="results-card__action-button"
                            type="button"
                            aria-label={t('reportWordError')}
                            onClick={showWordErrorModal}
                        >
                            {short ? <ErrorIcon /> : t('reportWordError')}
                        </button>
                        <button
                            className="results-card__action-button"
                            type="button"
                            aria-label={t('translates')}
                            onClick={showTranslations}
                        >
                            {short ? <TranslationsIcon /> : t('translates')}
                        </button>
                        {wordHasForms(item.original, item.details) && (
                            <button
                                className="results-card__action-button"
                                type="button"
                                aria-label={t('declensions')}
                                onClick={showDetail}
                            >
                                {short ? (
                                    <FormsIcon />
                                ) : (
                                    pos === 'verb' ? t('conjugation') : t('declensions')
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <div className={classNames('results-card__status-badge', { verified: item.checked })}>
                    {!short && (item.checked ? t('verified') : t('autoTranslation'))}
                </div>
            </div>
        );
    };
