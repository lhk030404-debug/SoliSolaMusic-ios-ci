# Temporary public iOS CI scope

This repository is a disposable, source-only CI mirror for validating the
unsigned iOS simulator build inherited from Audius apps commit
`57144304c433abdd344c0d07c37c26c31c71da9b`.

It intentionally contains a new Git history and excludes the private SoliSola
project plan, prompts, evidence, Android sources/signing fixtures, private
configuration, production credentials, deployment jobs, and store publishing
steps. The only source change from the selected Audius tree is the reconciled
iOS `Podfile.lock`; the only added automation is the manual, unsigned simulator
workflow in `.github/workflows/ios-baseline.yml`.

This mirror is not a product release, fork-of-record, deployment source, or
replacement for the private `SoliSolaMusic` repository. Its Actions run URL,
tested commit, and relevant hashes are copied back to private Gate 00 evidence.
