/**
 * KendoReact는 npm 문서 기준으로 Telerik 계정에서 발급한 스크립트 키가 필요합니다(유료/30일 평가판 동일).
 * `.env` 에 `VITE_KENDO_SCRIPT_KEY` 를 넣으면 워터마크·차단 없이 동작합니다.
 * https://www.telerik.com/kendo-react-ui/components/my-license/
 */
import { setScriptKey } from '@progress/kendo-licensing'

const k = import.meta.env.VITE_KENDO_SCRIPT_KEY as string | undefined
if (k?.trim()) setScriptKey(k.trim())
