const Memory =
  require("../models/Memory");

const Creation =
  require("../models/Creation");

const service =
  require(
    "../services/creationService"
  );

const imageGenerationService =
  require(
    "../services/imageGenerationService"
  );


/* =========================================================
   GÉNÉRATION
========================================================= */

exports.generate =
  async (
    req,
    res,
    next
  ) => {

  try {

    /* =====================================================
       SOUVENIR
    ===================================================== */

    const memory =
      await Memory.findById(
        req.params.id
      );


    if (!memory) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Souvenir introuvable.",

        });
    }


    /* =====================================================
       PROPRIÉTAIRE
    ===================================================== */

    if (
      Number(memory.owner_id) !==
      Number(req.user.id)
    ) {

      return res
        .status(403)
        .json({

          success: false,

          message:
            "Vous ne pouvez pas générer ce souvenir.",

        });
    }


    /* =====================================================
       TEXTE / TRANSCRIPTION
    ===================================================== */

    if (
      !memory.text_content
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Une transcription ou un texte est nécessaire avant la génération.",

        });
    }


    /* =====================================================
       STATUS
    ===================================================== */

    await Memory
      .setGenerationStatus(
        memory.id,
        "generating"
      );


    try {

      let result;

      const warnings = [];


      /* ===================================================
         LIVRE
      =================================================== */

      if (
        memory.memory_type ===
        "livre"
      ) {

        result =
          await service
            .generateBook(
              memory
            );


        await Creation
          .saveBook(

            memory.id,

            result.pages

          );
      }


      /* ===================================================
         VIDÉO
      =================================================== */

      else if (
        memory.memory_type ===
        "video"
      ) {

        const photos =
          await Memory.photos(
            memory.id
          );


        result =
          await service
            .generateVideo(
              memory,
              photos
            );


        await Creation
          .saveVideo(

            memory.id,

            result.scenes

          );
      }


      /* ===================================================
         BANDE DESSINÉE
      =================================================== */

      else {

        /* -------------------------------------------------
           PERSONNAGES
        ------------------------------------------------- */

        const characters =
          await Memory
            .characters(
              memory.id
            );


        /* -------------------------------------------------
           ÉCRITURE DE LA BD
        ------------------------------------------------- */

        result =
          await service
            .generateComic(
              memory,
              characters
            );


        /*
          Sauvegarde immédiate.

          Même si les images échouent,
          narration/dialogues restent
          enregistrés.
        */

        await Creation
          .saveComic(

            memory.id,

            result.panels

          );


        /* -------------------------------------------------
           IMAGES DES CASES
        ------------------------------------------------- */

        for (
          const panel
          of result.panels || []
        ) {

          try {

            const imageUrl =
              await imageGenerationService
                .generateComicPanelImage({

                  memory,

                  panel,

                  characters,

                });


            /* --------------------------------------------
               MYSQL
            -------------------------------------------- */

            await Creation
              .updateComicPanelImage(

                memory.id,

                panel.panel_number,

                imageUrl

              );


            panel.image_url =
              imageUrl;

          } catch (
            imageError
          ) {

            const message =
              imageError?.message ||
              String(
                imageError
              );


            console.error(

              `Échec image BD mémoire ${memory.id}, ` +
              `case ${panel.panel_number}:`,

              message

            );


            /*
              On continue les autres cases.
            */

            warnings.push(

              `Case ${panel.panel_number}: image non générée.`

            );
          }
        }
      }


      /* ===================================================
         TERMINÉ
      =================================================== */

      await Memory
        .setGenerationStatus(

          memory.id,

          "completed",

          result.title ||
          null

        );


      /* ===================================================
         RECHARGER LES DONNÉES MYSQL
      =================================================== */

      const freshMemory =
        await Memory
          .findById(
            memory.id
          );


      const storedCreation =
        await Creation
          .get(
            freshMemory
          );


      /* ===================================================
         RÉPONSE
      =================================================== */

      return res.json({

        success: true,


        message:

          warnings.length > 0

            ? "Création terminée avec certains avertissements."

            : "Création générée avec succès.",


        warnings,


        data: {

          type:
            memory.memory_type,


          title:
            result.title ||
            memory.title,


          creation:
            storedCreation,

        },

      });

    } catch (error) {

      /* ===================================================
         ÉCHEC GÉNÉRAL
      =================================================== */

      await Memory
        .setGenerationStatus(

          memory.id,

          "failed"

        );


      return res
        .status(502)
        .json({

          success: false,


          message:
            "Le souvenir est sauvegardé mais sa génération a échoué.",


          details:
            error?.message ||
            String(error),

        });
    }

  } catch (error) {

    next(error);
  }
};


/* =========================================================
   RÉCUPÉRER LA CRÉATION
========================================================= */

exports.getCreation =
  async (
    req,
    res,
    next
  ) => {

  try {

    const memory =
      await Memory.findById(
        req.params.id
      );


    if (!memory) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Souvenir introuvable.",

        });
    }


    /* =====================================================
       PRIVÉ / PUBLIC
    ===================================================== */

    if (
      Number(memory.owner_id) !==
        Number(req.user.id) &&

      memory.access_level !==
        "public"
    ) {

      return res
        .status(403)
        .json({

          success: false,

          message:
            "Accès refusé.",

        });
    }


    /* =====================================================
       DONNÉES
    ===================================================== */

    return res.json({

      success: true,


      data: {

        memory,


        photos:
          await Memory
            .photos(
              memory.id
            ),


        characters:

          memory.memory_type ===
          "bd"

            ? await Memory
                .characters(
                  memory.id
                )

            : [],


        attachments:
          await Memory
            .attachments(
              memory.id
            ),


        creation:
          await Creation
            .get(
              memory
            ),

      },

    });

  } catch (error) {

    next(error);
  }
};
