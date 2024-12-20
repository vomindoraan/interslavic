import classNames from 'classnames'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { hideModalDialog } from 'actions'
import { MODAL_DIALOG_TYPES } from 'reducers'

import { useModalDialog } from 'hooks'

import { DetailModal } from 'components/Modals/DetailModal'
import { TranslationsModal } from 'components/Modals/TranslationsModal'
import { WordErrorModal } from 'components/Modals/WordErrorModal'

import './ModalDialog.scss'

function getModalDialog(type: MODAL_DIALOG_TYPES) {
    switch (type) {
        case MODAL_DIALOG_TYPES.MODAL_DIALOG_TRANSLATION:
            return <TranslationsModal />
        case MODAL_DIALOG_TYPES.MODAL_DIALOG_WORD_FORMS:
            return <DetailModal />
        case MODAL_DIALOG_TYPES.MODAL_DIALOG_WORD_ERROR:
            return <WordErrorModal />
        default:
            return null
    }
}

export const ModalDialog =
    () => {
        const { type, show } = useModalDialog()
        const content = show ? getModalDialog(type) : null
        const dispatch = useDispatch()
        const onKeyPress = useCallback(({ code }) => {
            if (code === 'Escape') {
                dispatch(hideModalDialog())
            }
        }, [dispatch])
        const onBackdropClick = useCallback(() => {
            dispatch(hideModalDialog())
        }, [dispatch])

        useEffect(() => {
            window.addEventListener('keyup', onKeyPress)

            return () => {
                window.removeEventListener('keyup', onKeyPress)
            }
        }, [onKeyPress])

        return (
            <div className={classNames('modal-dialog-container', { show })}>
                <div className="modal-dialog-back" onClick={onBackdropClick}/>
                <dialog className="modal-dialog">
                    {content}
                </dialog>
            </div>
        )
    }
