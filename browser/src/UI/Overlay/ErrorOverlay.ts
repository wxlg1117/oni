import * as _ from "lodash"
import * as path from "path"

import { renderErrorMarkers } from "./../components/Error"

import { IOverlay } from "./OverlayManager"
import { WindowContext } from "./WindowContext"

import * as types from "vscode-languageserver-types"

derp

export class ErrorOverlay implements IOverlay {

    private _element: HTMLElement
    private _errors: { [fileName: string]: any } = {}
    private _currentFileName: string
    private _lastWindowContext: WindowContext

    /**
     * Whether or not error details should be shown.
     * In insert mode, we shouldn't show details, because that will overlay completion elements
     * Some LSP providers push error data while changes are being made, whereas others wait until save.
     */
    private _showDetails: boolean

    public onVimEvent(_eventName: string, eventContext: Oni.EventContext): void {

        if (_eventName === "BufEnter") {
            const fullPath = eventContext.bufferFullPath
            this._currentFileName = fullPath

            this._showErrors()
        }
    }

    public showDetails(): void {
        this._showDetails = true
        this._showErrors()
    }

    public hideDetails(): void {
        this._showDetails = false
        this._showErrors()
    }

    public setErrors(key: string, fileName: string, errors: types.Diagnostic[]): void {
        fileName = path.normalize(fileName)
        this._errors[fileName] = this._errors[fileName] || {}
        this._errors[fileName][key] = errors

        this._showErrors()
    }

    public update(element: HTMLElement, windowContext: WindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._showErrors()
    }

    private _showErrors(): void {

        if (!this._currentFileName) {
            return
        }

        if (!this._element) {
            return
        }

        if (!this._errors) {
            this._element.textContent = ""
            return
        }

        const errors = this._errors[this._currentFileName]
        let allErrors: types.Diagnostic[] = []

        if (errors) {
            allErrors = _.flatten<types.Diagnostic>(_.values<types.Diagnostic>(errors))
        }

        renderErrorMarkers({
            errors: allErrors,
            windowContext: this._lastWindowContext,
            showDetails: this._showDetails,
        }, this._element)
    }
}
