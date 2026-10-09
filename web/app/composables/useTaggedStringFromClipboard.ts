export function useTaggedStringFromClipboard(tag: string) {
  const content = ref<string | null>(null)
  const tagPrefix = `${tag}-`

  onMounted(async () => {
    window.navigator.clipboard.addEventListener("clipboardchange", checkClipboardContent)
    await checkClipboardContent()
  })

  onBeforeUnmount(() => {
    window.navigator.clipboard.removeEventListener("clipboardchange", checkClipboardContent)
  })

  async function checkClipboardContent() {
    const clipboardContent = await window.navigator.clipboard.readText()
    content.value = clipboardContent.startsWith(tagPrefix)
      ? clipboardContent.substring(tagPrefix.length)
      : null
  }

  async function setContent(content: string) {
    await window.navigator.clipboard.writeText(`${tagPrefix}${content}`)
  }

  return {content, setContent}
}
