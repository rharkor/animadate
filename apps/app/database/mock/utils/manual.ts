// This is a utility file that is used to generate random data and print it to the console.
import { config } from "dotenv"
import { writeFile } from "fs/promises"

import { cmd, logger } from "@animadate/lib"

import dogsJson from "../dogs.json"
config()
import inquirer from "inquirer"

import { s3Client } from "@/lib/s3"
import { CHARACTERISTIC } from "@animadate/app-db/generated/client"
import { PutObjectCommand } from "@aws-sdk/client-s3"

const generateLocations = async () => {
  function generateRandomLocation(center: { latitude: number; longitude: number }, radius: number) {
    const { latitude, longitude } = center

    // Convert radius from kilometers to degrees
    const radiusInDegrees = radius / 111.32

    const u = Math.random()
    const v = Math.random()

    const w = radiusInDegrees * Math.sqrt(u)
    const t = 2 * Math.PI * v

    const x = w * Math.cos(t)
    const y = w * Math.sin(t)

    // Adjust the x-coordinate for the shrinking of the east-west distances
    const new_x = x / Math.cos(latitude * (Math.PI / 180))

    const newLatitude = latitude + y
    const newLongitude = longitude + new_x

    return {
      latitude: newLatitude,
      longitude: newLongitude,
    }
  }

  function generateMultipleRandomLocations(
    center: { latitude: number; longitude: number },
    radius: number,
    count: number
  ) {
    const locations = []
    for (let i = 0; i < count; i++) {
      locations.push(generateRandomLocation(center, radius))
    }
    return locations
  }

  async function reverseGeocode(location: { latitude: number; longitude: number }) {
    const { latitude, longitude } = location
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`

    try {
      const response = await fetch(url)
      return response.json() as Promise<{
        display_name: string
        name: string
      }>
    } catch (error) {
      logger.error("Error fetching address from location:")
      throw error
    }
  }

  const center = { latitude: 44.840699, longitude: -0.593899 } // Bordeaux, France
  const radius = 6.3 // 6.3 kilometers

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "count",
      message: "Enter the number of random locations to generate:",
      default: 10,
    },
  ])
  const count = parseInt(answers.count)

  const task = cmd.startTask({
    name: `Generating ${count} random locations`,
  })
  const randomLocations = generateMultipleRandomLocations(center, radius, count)
  // Reverse geocode
  const results: { latitude: number; longitude: number; name: string }[] = []
  let i = 0
  for (const location of randomLocations) {
    const res = await reverseGeocode(location)
    results.push({
      ...location,
      name: res.display_name,
    })
    task.print(
      `[${(i + 1).toString().padStart(count.toString().length, "0")}/${count.toString()}] Generated location: (lat: ${location.latitude}, lon: ${location.longitude})`
    )
    i++
  }
  // Format it
  const json = JSON.stringify(results, null, 2)
  await writeFile("random-locations.tmp.json", json)
  task.stop(`Generated ${count} random locations and saved them to random-locations.tmp.json`)
}

const fillDogsChars = async () => {
  const users: {
    email: string
    name: string
    password: string
  }[] = []
  const dogs: {
    name: string
    breed: string
    birthdate: string
    description: string
  }[] = []

  if (users.length !== dogs.length) {
    throw new Error("The number of users and dogs must be the same")
  }

  // Between 2 and 5 characteristics
  const getRandomCharacteristics = () => {
    const characteristics = Object.values(CHARACTERISTIC)
    const number = Math.floor(Math.random() * 4) + 2
    const randomCharacteristics: { [key: string]: CHARACTERISTIC } = {}
    for (let i = 0; i < number; i++) {
      let it = 0
      while (true) {
        if (it > 100) {
          throw new Error("Infinite loop in getRandomCharacteristics()")
        }
        const char = characteristics[Math.floor(Math.random() * characteristics.length)]
        if (!randomCharacteristics[char]) {
          randomCharacteristics[char] = char
          break
        }
        it++
      }
    }
    return Object.values(randomCharacteristics)
  }

  const photos = ["1", "2"] // 2 photos
  const out: {
    owner_email: string
    name: string
    breed: string
    birthdate: string
    description: string
    characteristics: string[]
    photos: string[]
  }[] = []

  for (let i = 0; i < users.length; i++) {
    const dog = dogs[i]
    const user = users[i]
    out.push({
      owner_email: user.email,
      name: dog.name,
      breed: dog.breed,
      birthdate: dog.birthdate,
      description: dog.description,
      characteristics: getRandomCharacteristics(),
      photos,
    })
  }

  const json = JSON.stringify(out, null, 2)
  await writeFile("dogs-filled.tmp.json", json)
  logger.info(`Generated ${out.length} dogs and saved them to dogs-filled.tmp.json`)
}

const checkDogsDuplicates = async () => {
  // Check for dogs that have duplicate names or owners
  const duplicates: { name: string; owner_email: string; problem: "name" | "owner" }[] = []
  const names = new Set<string>()
  const owners = new Set<string>()
  for (const dog of dogsJson) {
    if (names.has(dog.name)) {
      duplicates.push({ name: dog.name, owner_email: dog.owner_email, problem: "name" })
    }
    names.add(dog.name)
    if (owners.has(dog.owner_email)) {
      duplicates.push({ name: dog.name, owner_email: dog.owner_email, problem: "owner" })
    }
    owners.add(dog.owner_email)
  }
  if (duplicates.length > 0) {
    logger.error("Found duplicates:")
    for (const duplicate of duplicates) {
      logger.error(`- ${duplicate.name} owned by ${duplicate.owner_email} (${duplicate.problem})`)
    }
  } else {
    logger.info("No duplicates found")
  }
}

const fillDogsImages = async () => {
  const dogs: {
    owner_email: string
    name: string
    breed: string
    birthdate: string
    description: string
    characteristics: string[]
    photos: string[]
  }[] = []

  const task = cmd.startTask({
    name: `Filling dogs images`,
  })

  const _getDogImage = async () => {
    const randomPhoto = await fetch("https://placedog.net/random/image")
    const json = (await randomPhoto.json()) as {
      id: string
      width: number
      height: number
      url: string
    }
    const url = `https://placedog.net/${json.width}/${json.height}?id=${json.id}`
    return { url, width: json.width, height: json.height }
  }
  const minWidth = 500
  const minHeight = 500
  const getDogImage = async () => {
    // Use _getDogImage but ensure that the image is at least 500x500
    let it = 0
    let img = await _getDogImage()
    while (img.width < minWidth || img.height < minHeight) {
      if (it > 100) {
        throw new Error("Infinite loop in getDogImage()")
      }
      img = await _getDogImage()
      it++
    }
    return img
  }

  if (!s3Client) {
    throw new Error("S3 client not found")
  }

  for (const dog of dogs) {
    // Fetch photos
    const photosUrl = await Promise.all(dog.photos.map(getDogImage))
    const photos = photosUrl.map((photo, index) => ({
      id: index,
      url: photo.url,
    }))
    task.print(`Fetched image for ${dog.name}`)
    // Upload to S3
    for (const photo of photos) {
      const photoResponse = await fetch(photo.url)
      const arrayBuffer = await photoResponse.arrayBuffer()
      const key = `dogs/pet-profile/mock/${dog.name.toLowerCase()}/${photo.id}.jpg`
      const command = new PutObjectCommand({
        Bucket: "animadate-public",
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
      await s3Client.send(command)
      task.print(`Uploaded image for ${dog.name} (${key})`)
    }
  }
  task.stop(`Filled images for ${dogs.length} dogs`)
  s3Client.destroy()
}

const main = async () => {
  const scripts: { name: string; script: () => Promise<void> }[] = [
    {
      name: "Generate random locations",
      script: generateLocations,
    },
    {
      name: "Fill dogs characteristics",
      script: fillDogsChars,
    },
    {
      name: "Check dogs duplicates",
      script: checkDogsDuplicates,
    },
    {
      name: "Fill dogs images",
      script: fillDogsImages,
    },
  ]
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "script",
      message: "Choose a script to run:",
      choices: scripts.map((script) => script.name),
    },
  ])
  const selectedScript = scripts.find((script) => script.name === answers.script)
  if (!selectedScript) {
    console.error("Script not found")
    return
  }
  await selectedScript.script()
}

main()
